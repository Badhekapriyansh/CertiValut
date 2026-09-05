const fs = require('fs');
const path = require('path');

function decodeUleb128(buf, offset) {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;
  while (true) {
    const byte = buf[offset + bytesRead++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return { value: result, bytesRead };
}

function decodeSleb128(buf, offset) {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;
  let byte = 0;
  while (true) {
    byte = buf[offset + bytesRead++];
    result |= (byte & 0x7f) << shift;
    shift += 7;
    if ((byte & 0x80) === 0) break;
  }
  if (shift < 32 && (byte & 0x40) !== 0) {
    result |= (~0 << shift);
  }
  return { value: result, bytesRead };
}

function decodeSleb64(buf, offset) {
  let result = 0n;
  let shift = 0n;
  let bytesRead = 0;
  let byte = 0;
  while (true) {
    byte = buf[offset + bytesRead++];
    result |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
    if ((byte & 0x80) === 0) break;
  }
  if (shift < 64n && (byte & 0x40) !== 0) {
    result |= (~0n << shift);
  }
  return { value: result, bytesRead };
}

function encodeUleb128(val) {
  const bytes = [];
  do {
    let byte = val & 0x7f;
    val >>>= 7;
    if (val !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (val !== 0);
  return Buffer.from(bytes);
}

function normalizeWasmFile(wasmPath) {
  const rawWasm = fs.readFileSync(wasmPath);

  let pos = 8;
  const sections = [];
  while (pos < rawWasm.length) {
    const secId = rawWasm[pos++];
    const { value: secSize, bytesRead: secSizeLen } = decodeUleb128(rawWasm, pos);
    pos += secSizeLen;
    const secData = rawWasm.subarray(pos, pos + secSize);
    pos += secSize;
    sections.push({ id: secId, data: secData });
  }

  const codeSec = sections.find((s) => s.id === 10);
  if (!codeSec) return rawWasm;

  const { value: numFuncs, bytesRead: numFuncsLen } = decodeUleb128(codeSec.data, 0);
  let p = numFuncsLen;
  const newFuncBodies = [];
  let fixedCalls = 0;

  for (let funcIdx = 0; funcIdx < numFuncs; funcIdx++) {
    const { value: bodySize, bytesRead: bodySizeLen } = decodeUleb128(codeSec.data, p);
    p += bodySizeLen;
    const bodyEnd = p + bodySize;

    const localsStart = p;
    const { value: numLocals, bytesRead: numLocalsLen } = decodeUleb128(codeSec.data, p);
    p += numLocalsLen;
    for (let l = 0; l < numLocals; l++) {
      const { bytesRead: countLen } = decodeUleb128(codeSec.data, p);
      p += countLen + 1;
    }
    const localsHeader = codeSec.data.subarray(localsStart, p);

    const newInsts = [];
    while (p < bodyEnd) {
      const opcode = codeSec.data[p++];
      if (opcode === 0x11) {
        const typeDec = decodeUleb128(codeSec.data, p);
        p += typeDec.bytesRead;
        const tableDec = decodeUleb128(codeSec.data, p);
        p += tableDec.bytesRead;

        newInsts.push(0x11);
        const encType = encodeUleb128(typeDec.value);
        for (const b of encType) newInsts.push(b);
        newInsts.push(0x00);
        fixedCalls++;
      } else if (opcode === 0x00 || opcode === 0x01 || opcode === 0x05 || opcode === 0x0b || opcode === 0x0f || opcode === 0x1a || opcode === 0x1b) {
        newInsts.push(opcode);
      } else if (opcode === 0x02 || opcode === 0x03 || opcode === 0x04) {
        newInsts.push(opcode);
        const bt = codeSec.data[p];
        if (bt === 0x40 || bt === 0x7f || bt === 0x7e || bt === 0x7d || bt === 0x7c) {
          newInsts.push(codeSec.data[p++]);
        } else {
          const sDec = decodeSleb128(codeSec.data, p);
          const start = p;
          p += sDec.bytesRead;
          for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
        }
      } else if (opcode === 0x0c || opcode === 0x0d || opcode === 0x10 || (opcode >= 0x20 && opcode <= 0x24)) {
        newInsts.push(opcode);
        const uDec = decodeUleb128(codeSec.data, p);
        const start = p;
        p += uDec.bytesRead;
        for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
      } else if (opcode === 0x0e) {
        newInsts.push(opcode);
        const countDec = decodeUleb128(codeSec.data, p);
        const start = p;
        p += countDec.bytesRead;
        for (let t = 0; t < countDec.value; t++) {
          const lDec = decodeUleb128(codeSec.data, p);
          p += lDec.bytesRead;
        }
        const defDec = decodeUleb128(codeSec.data, p);
        p += defDec.bytesRead;
        for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
      } else if (opcode >= 0x28 && opcode <= 0x3e) {
        newInsts.push(opcode);
        const aDec = decodeUleb128(codeSec.data, p);
        p += aDec.bytesRead;
        const oDec = decodeUleb128(codeSec.data, p);
        p += oDec.bytesRead;
        const encA = encodeUleb128(aDec.value);
        for (const b of encA) newInsts.push(b);
        const encO = encodeUleb128(oDec.value);
        for (const b of encO) newInsts.push(b);
      } else if (opcode === 0x3f || opcode === 0x40) {
        newInsts.push(opcode);
        newInsts.push(codeSec.data[p++]);
      } else if (opcode === 0x41) {
        newInsts.push(opcode);
        const sDec = decodeSleb128(codeSec.data, p);
        const start = p;
        p += sDec.bytesRead;
        for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
      } else if (opcode === 0x42) {
        newInsts.push(opcode);
        const sDec = decodeSleb64(codeSec.data, p);
        const start = p;
        p += sDec.bytesRead;
        for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
      } else if (opcode === 0x43) {
        newInsts.push(opcode);
        for (let i = 0; i < 4; i++) newInsts.push(codeSec.data[p++]);
      } else if (opcode === 0x44) {
        newInsts.push(opcode);
        for (let i = 0; i < 8; i++) newInsts.push(codeSec.data[p++]);
      } else if (opcode >= 0x45 && opcode <= 0xc4) {
        newInsts.push(opcode);
      } else if (opcode === 0xfc) {
        newInsts.push(opcode);
        const subDec = decodeUleb128(codeSec.data, p);
        const start = p;
        p += subDec.bytesRead;
        for (let i = start; i < p; i++) newInsts.push(codeSec.data[i]);
        if (subDec.value === 10) {
          newInsts.push(codeSec.data[p++]);
          newInsts.push(codeSec.data[p++]);
        } else if (subDec.value === 11) {
          newInsts.push(codeSec.data[p++]);
        } else if (subDec.value === 8) {
          const segDec = decodeUleb128(codeSec.data, p);
          const s2 = p;
          p += segDec.bytesRead;
          for (let i = s2; i < p; i++) newInsts.push(codeSec.data[i]);
          newInsts.push(codeSec.data[p++]);
        } else if (subDec.value === 9) {
          const segDec = decodeUleb128(codeSec.data, p);
          const s2 = p;
          p += segDec.bytesRead;
          for (let i = s2; i < p; i++) newInsts.push(codeSec.data[i]);
        }
      }
    }

    const fullBody = Buffer.concat([localsHeader, Buffer.from(newInsts)]);
    const bodySizeHeader = encodeUleb128(fullBody.length);
    newFuncBodies.push(Buffer.concat([bodySizeHeader, fullBody]));
  }

  const newCodeSecData = Buffer.concat([encodeUleb128(numFuncs), ...newFuncBodies]);
  codeSec.data = newCodeSecData;

  const wasmParts = [rawWasm.subarray(0, 8)];
  for (const sec of sections) {
    wasmParts.push(Buffer.from([sec.id]));
    wasmParts.push(encodeUleb128(sec.data.length));
    wasmParts.push(sec.data);
  }
  const finalWasm = Buffer.concat(wasmParts);
  fs.writeFileSync(wasmPath, finalWasm);
  return finalWasm;
}

module.exports = { normalizeWasmFile };
