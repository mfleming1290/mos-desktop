// ../.cache/sdk/node_modules/skir-client/dist/esm/skir-client.js
var Timestamp = class _Timestamp {
  /**
   * Returns a `Timestamp` representing the same moment in time as the given
   * Javascript `Date` object.
   *
   * @throws if the given `Date` object has a timestamp value of NaN
   */
  static from(date) {
    return this.fromUnixMillis(date.getTime());
  }
  /**
   * Creates a `Timestamp` object from a number of milliseconds from the Unix
   * epoch.
   *
   * If the given number if outside the valid range (±8,640,000,000,000,000),
   * this function will return `Timestamp.MAX` or `Timestamp.MIN` depending on
   * the sign of the number.
   *
   * @throws if the given number is NaN
   */
  static fromUnixMillis(unixMillis) {
    if (unixMillis <= this.MIN.unixMillis) {
      return _Timestamp.MIN;
    } else if (unixMillis < _Timestamp.MAX.unixMillis) {
      return new _Timestamp(Math.round(unixMillis));
    } else if (Number.isNaN(unixMillis)) {
      throw new Error("Cannot construct Timestamp from NaN");
    } else {
      return _Timestamp.MAX;
    }
  }
  /**
   * Creates a `Timestamp` object from a number of seconds from the Unix epoch.
   *
   * If the given number if outside the valid range (±8,640,000,000,000), this
   * function will return `Timestamp.MAX` or `Timestamp.MIN` depending on the
   * sign of the number.
   *
   * @throws if the given number is NaN
   */
  static fromUnixSeconds(unixSeconds) {
    return this.fromUnixMillis(unixSeconds * 1e3);
  }
  /**
   * Parses a date in the date time string format.
   *
   * @throws if the given string is not a date in the date time string format
   * @see https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
   */
  static parse(date) {
    return this.fromUnixMillis(Date.parse(date));
  }
  /** Returns a `Timestamp` representing the current moment in time. */
  static now() {
    return this.fromUnixMillis(Date.now());
  }
  constructor(unixMillis) {
    this.unixMillis = unixMillis;
    Object.freeze(this);
  }
  /** Number of seconds ellapsed since the Unix epoch. */
  get unixSeconds() {
    return this.unixMillis / 1e3;
  }
  /**
   * Returns a `Date` object representing the same moment in time as this
   * `Timestamp`.
   */
  toDate() {
    return new Date(this.unixMillis);
  }
  toString() {
    return this.toDate().toISOString();
  }
};
Timestamp.UNIX_EPOCH = new Timestamp(0);
Timestamp.MIN = new Timestamp(-864e13);
Timestamp.MAX = new Timestamp(864e13);
var ByteString = class _ByteString {
  /**
   * Returns an immutable byte string containing all the bytes of `input` from
   * `start`, inclusive, up to `end`, exclusive.
   *
   * If `input` is an `ArrayBuffer`, this function copies the bytes. Otherwise
   * this function returns a sliced view of the input `ByteString`.
   *
   * @example <caption>Copy an array buffer into a byte string</caption>
   * const byteString = ByteString.sliceOf(arrayBuffer);
   */
  static sliceOf(input, start = 0, end) {
    const { byteLength } = input;
    if (start < 0) {
      start = 0;
    }
    if (end === void 0 || end > byteLength) {
      end = byteLength;
    }
    if (end <= start) {
      return _ByteString.EMPTY;
    }
    if (input instanceof _ByteString) {
      if (start <= 0 && byteLength <= end) {
        return input;
      } else {
        const newByteOffset = input.byteOffset + start;
        const newByteLength = end - start;
        return new _ByteString(input.arrayBuffer, newByteOffset, newByteLength);
      }
    } else if (input instanceof ArrayBuffer) {
      return new _ByteString(input.slice(start, end));
    } else if (input instanceof SharedArrayBuffer) {
      const slice = input.slice(start, end);
      const newBuffer = new ArrayBuffer(slice.byteLength);
      new Uint8Array(newBuffer).set(new Uint8Array(slice));
      return new _ByteString(newBuffer);
    } else {
      const _ = input;
      throw new TypeError(_);
    }
  }
  /**
   * Decodes a Base64 string, which can be obtained by calling `toBase64()`.
   *
   * @throws if the given string is not a valid Base64 string.
   * @see https://en.wikipedia.org/wiki/Base64
   */
  static fromBase64(base64) {
    const binaryString = atob(base64);
    const array = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
    return new this(array.buffer);
  }
  /**
   * Decodes a hexadecimal string, which can be obtained by calling
   * `toBase16()`.
   *
   * @throws if the given string is not a valid Base64 string.
   */
  static fromBase16(base16) {
    const bytes = new Uint8Array(base16.length / 2);
    for (let i = 0; i < bytes.length; ++i) {
      const byte = parseInt(base16.substring(i * 2, i * 2 + 2), 16);
      if (Number.isNaN(byte)) {
        throw new Error("Not a valid Base64 string");
      }
      bytes[i] = byte;
    }
    return new _ByteString(bytes.buffer);
  }
  /** Copies the contents of this byte string into the given array buffer. */
  copyTo(target, targetOffset = 0) {
    new Uint8Array(target).set(this.uint8Array, targetOffset);
  }
  /** Copies the contents of this byte string into a new array buffer. */
  toBuffer() {
    return this.arrayBuffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
  }
  /**
   * Encodes this byte string into a Base64 string.
   *
   * @see https://en.wikipedia.org/wiki/Base64
   */
  toBase64() {
    const binaryString = Array.from(this.uint8Array, (x) => String.fromCodePoint(x)).join("");
    return btoa(binaryString);
  }
  /** Encodes this byte string into a hexadecimal string. */
  toBase16() {
    return [...this.uint8Array].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  at(index) {
    return this.uint8Array[index < 0 ? index + this.byteLength : index];
  }
  toString() {
    return `ByteString(${this.byteLength})`;
  }
  constructor(arrayBuffer, byteOffset = 0, byteLength = arrayBuffer.byteLength) {
    this.arrayBuffer = arrayBuffer;
    this.byteOffset = byteOffset;
    this.byteLength = byteLength;
    this.uint8Array = new Uint8Array(arrayBuffer, byteOffset, byteLength);
    Object.freeze(this);
  }
};
ByteString.EMPTY = new ByteString(new ArrayBuffer(0));
function primitiveSerializer(primitiveType) {
  return primitiveSerializers[primitiveType];
}
function arraySerializer(item, keyChain) {
  if (keyChain !== void 0 && !/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/.test(keyChain)) {
    throw new Error(`Invalid keyChain "${keyChain}"`);
  }
  return new ArraySerializerImpl(item, keyChain);
}
function optionalSerializer(other) {
  return other instanceof OptionalSerializerImpl ? other : new OptionalSerializerImpl(other);
}
var InputStream = class {
  constructor(buffer, keep) {
    this.buffer = buffer;
    this.offset = 0;
    this.dataView = new DataView(buffer);
    this.keepUnrecognizedValues = !!keep;
  }
  readUint8() {
    return this.dataView.getUint8(this.offset++);
  }
};
var DECODE_NUMBER_FNS = [
  (s) => s.dataView.getUint16((s.offset += 2) - 2, true),
  (s) => s.dataView.getUint32((s.offset += 4) - 4, true),
  (s) => s.dataView.getBigUint64((s.offset += 8) - 8, true),
  (stream) => stream.readUint8() - 256,
  (s) => s.dataView.getUint16((s.offset += 2) - 2, true) - 65536,
  (s) => s.dataView.getInt32((s.offset += 4) - 4, true),
  (s) => s.dataView.getBigInt64((s.offset += 8) - 8, true),
  (s) => s.dataView.getBigInt64((s.offset += 8) - 8, true),
  (s) => s.dataView.getFloat32((s.offset += 4) - 4, true),
  (s) => s.dataView.getFloat64((s.offset += 8) - 8, true)
];
function decodeNumber(stream) {
  const wire = stream.readUint8();
  return wire < 232 ? wire : DECODE_NUMBER_FNS[wire - 232](stream);
}
function decodeBigInt(stream) {
  const number = decodeNumber(stream);
  return typeof number === "bigint" ? number : BigInt(Math.round(number));
}
var OutputStream = class {
  constructor() {
    this.buffer = new ArrayBuffer(128);
    this.dataView = new DataView(this.buffer);
    this.offset = 0;
    this.pieces = [];
    this.byteLength = 0;
  }
  writeUint8(value) {
    const dataView = this.reserve(1);
    dataView.setUint8(++this.offset - 1, value);
  }
  writeUint16(value) {
    const dataView = this.reserve(2);
    dataView.setUint16((this.offset += 2) - 2, value, true);
  }
  writeUint32(value) {
    const dataView = this.reserve(4);
    dataView.setUint32((this.offset += 4) - 4, value, true);
  }
  writeInt32(value) {
    const dataView = this.reserve(4);
    dataView.setInt32((this.offset += 4) - 4, value, true);
  }
  writeHash64(value) {
    const dataView = this.reserve(8);
    dataView.setBigUint64((this.offset += 8) - 8, value, true);
  }
  writeInt64(value) {
    const dataView = this.reserve(8);
    dataView.setBigInt64((this.offset += 8) - 8, value, true);
  }
  writeFloat32(value) {
    const dataView = this.reserve(4);
    dataView.setFloat32((this.offset += 4) - 4, value, true);
  }
  writeFloat64(value) {
    const dataView = this.reserve(8);
    dataView.setFloat64((this.offset += 8) - 8, value, true);
  }
  /**
   * Encodes the given string to UTF-8 and writes the bytes to this stream.
   * Returns the number of bytes written.
   */
  putUtf8String(string) {
    let dataView = this.dataView;
    let result = 0;
    while (string) {
      const encodeResult = textEncoder.encodeInto(string, new Uint8Array(dataView.buffer, this.offset));
      this.offset += encodeResult.written;
      result += encodeResult.written;
      string = string.substring(encodeResult.read);
      if (string) {
        dataView = this.reserve(string.length * 2);
      }
    }
    return result;
  }
  putBytes(bytes) {
    const { buffer } = this;
    const bytesLeftInCurrentBuffer = buffer.byteLength - this.offset;
    const head = ByteString.sliceOf(bytes, 0, bytesLeftInCurrentBuffer);
    head.copyTo(buffer, this.offset);
    this.offset += head.byteLength;
    const remainingBytes = bytes.byteLength - head.byteLength;
    if (remainingBytes <= 0) {
      return;
    }
    const tail = ByteString.sliceOf(bytes, remainingBytes);
    this.reserve(remainingBytes);
    tail.copyTo(buffer, this.offset);
    this.offset += remainingBytes;
  }
  finalize() {
    this.flush();
    Object.freeze(this.pieces);
    Object.freeze(this);
    return this;
  }
  copyTo(target, offset = 0) {
    const targetArea = new Uint8Array(target);
    for (const piece of this.pieces) {
      targetArea.set(piece, offset);
      offset += piece.length;
    }
  }
  toBuffer() {
    const result = new ArrayBuffer(this.byteLength);
    this.copyTo(result);
    return result;
  }
  /** Returns a data view with enough capacity for `bytes` more bytes. */
  reserve(bytes) {
    if (this.offset < this.buffer.byteLength - bytes) {
      return this.dataView;
    }
    this.flush();
    const lengthInBytes = Math.max(this.byteLength, bytes);
    this.offset = 0;
    this.buffer = new ArrayBuffer(lengthInBytes);
    return this.dataView = new DataView(this.buffer);
  }
  /** Adds the current buffer to `pieces`. Updates `byteLength` accordingly. */
  flush() {
    const { offset } = this;
    this.pieces.push(new Uint8Array(this.dataView.buffer, 0, offset));
    this.byteLength += offset;
  }
};
function encodeUint32(length, stream) {
  if (length < 232) {
    stream.writeUint8(length);
  } else if (length < 65536) {
    stream.writeUint8(232);
    stream.writeUint16(length);
  } else if (length < 4294967296) {
    stream.writeUint8(233);
    stream.writeUint32(length);
  } else {
    throw new Error(`max length exceeded: ${length}`);
  }
}
var AbstractSerializer = class {
  fromJsonCode(code, keep) {
    return this.fromJson(JSON.parse(code), keep);
  }
  fromBytes(bytes, keep) {
    const inputStream = new InputStream(bytes, keep);
    inputStream.offset = 4;
    return this.decode(inputStream);
  }
  toJsonCode(input, flavor) {
    const indent = flavor === "readable" ? "  " : void 0;
    return JSON.stringify(this.toJson(input, flavor), void 0, indent);
  }
  toBytes(input) {
    const stream = new OutputStream();
    stream.putUtf8String("skir");
    this.encode(input, stream);
    return stream.finalize();
  }
  // Default implementation; this behavior is not correct for all subclasses.
  isDefault(input) {
    return !input;
  }
  get typeDescriptor() {
    return this;
  }
  asJson() {
    const recordDefinitions = {};
    this.addRecordDefinitionsTo(recordDefinitions);
    const result = {
      type: this.typeSignature,
      records: Object.values(recordDefinitions)
    };
    return result;
  }
  asJsonCode() {
    return JSON.stringify(this.asJson(), void 0, "  ");
  }
  transform(json_or_bytes, out) {
    const decoded = json_or_bytes instanceof ArrayBuffer ? this.fromBytes(json_or_bytes) : this.fromJson(json_or_bytes);
    return out === "bytes" ? this.toBytes(decoded).toBuffer() : this.toJson(decoded, out);
  }
};
var AbstractPrimitiveSerializer = class extends AbstractSerializer {
  constructor() {
    super(...arguments);
    this.kind = "primitive";
  }
  get typeSignature() {
    return {
      kind: "primitive",
      value: this.primitive
    };
  }
  addRecordDefinitionsTo(_out) {
  }
};
var BoolSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "bool";
    this.defaultValue = false;
  }
  toJson(input, flavor) {
    return flavor === "readable" ? !!input : input ? 1 : 0;
  }
  fromJson(json) {
    return !!json && json !== "0";
  }
  encode(input, stream) {
    stream.writeUint8(input ? 1 : 0);
  }
  decode(stream) {
    return !!decodeNumber(stream);
  }
};
var Int32Serializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "int32";
    this.defaultValue = 0;
  }
  toJson(input) {
    return input | 0;
  }
  fromJson(json) {
    return +json | 0;
  }
  encode(input, stream) {
    if (input < 0) {
      if (input >= -256) {
        stream.writeUint8(235);
        stream.writeUint8(input + 256);
      } else if (input >= -65536) {
        stream.writeUint8(236);
        stream.writeUint16(input + 65536);
      } else {
        stream.writeUint8(237);
        stream.writeInt32(input >= -2147483648 ? input : -2147483648);
      }
    } else if (input < 232) {
      stream.writeUint8(input);
    } else if (input < 65536) {
      stream.writeUint8(232);
      stream.writeUint16(input);
    } else {
      stream.writeUint8(233);
      stream.writeUint32(input <= 2147483647 ? input : 2147483647);
    }
  }
  decode(stream) {
    return Number(decodeNumber(stream)) | 0;
  }
};
var int32_Serializer = new Int32Serializer();
var FloatSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.defaultValue = 0;
  }
  toJson(input) {
    if (Number.isFinite(input)) {
      return input;
    } else if (typeof input === "number") {
      return input.toString();
    }
    throw new TypeError();
  }
  fromJson(json) {
    return +json;
  }
  decode(stream) {
    return Number(decodeNumber(stream));
  }
  isDefault(input) {
    return input === 0;
  }
};
var Float32Serializer = class extends FloatSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "float32";
  }
  encode(input, stream) {
    if (input === 0) {
      stream.writeUint8(0);
    } else {
      stream.writeUint8(240);
      stream.writeFloat32(input);
    }
  }
};
var Float64Serializer = class extends FloatSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "float64";
  }
  encode(input, stream) {
    if (input === 0) {
      stream.writeUint8(0);
    } else {
      stream.writeUint8(241);
      stream.writeFloat64(input);
    }
  }
};
var AbstractBigIntSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.defaultValue = BigInt(0);
  }
  fromJson(json) {
    try {
      return BigInt(json);
    } catch (e) {
      if (typeof json === "number") {
        return BigInt(Math.round(json));
      } else {
        throw e;
      }
    }
  }
};
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var Int64Serializer = class extends AbstractBigIntSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "int64";
  }
  toJson(input) {
    if (-9007199254740991 <= input && input <= 9007199254740991) {
      return Number(input);
    }
    const s = BigInt(input).toString();
    return s.length <= 18 ? (
      // Small optimization for "small" numbers. The max int64 has 19 digits.
      s
    ) : input < MIN_INT64 ? MIN_INT64.toString() : input < MAX_INT64 ? s : MAX_INT64.toString();
  }
  encode(input, stream) {
    if (input) {
      if (-2147483648 <= input && input <= 2147483647) {
        int32_Serializer.encode(Number(input), stream);
      } else {
        stream.writeUint8(238);
        stream.writeInt64(input < MIN_INT64 ? MIN_INT64 : input < MAX_INT64 ? input : MAX_INT64);
      }
    } else {
      stream.writeUint8(0);
    }
  }
  decode(stream) {
    return decodeBigInt(stream);
  }
};
var MAX_HASH64 = BigInt("18446744073709551615");
var Hash64Serializer = class extends AbstractBigIntSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "hash64";
  }
  toJson(input) {
    if (input <= 9007199254740991) {
      return input <= 0 ? 0 : Number(input);
    }
    input = BigInt(input);
    return MAX_HASH64 < input ? MAX_HASH64.toString() : input.toString();
  }
  encode(input, stream) {
    if (input < 232) {
      stream.writeUint8(input <= 0 ? 0 : Number(input));
    } else if (input < 4294967296) {
      if (input < 65536) {
        stream.writeUint8(232);
        stream.writeUint16(Number(input));
      } else {
        stream.writeUint8(233);
        stream.writeUint32(Number(input));
      }
    } else {
      stream.writeUint8(234);
      stream.writeHash64(input <= MAX_HASH64 ? input : MAX_HASH64);
    }
  }
  decode(stream) {
    return decodeBigInt(stream);
  }
};
var TimestampSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "timestamp";
    this.defaultValue = Timestamp.UNIX_EPOCH;
  }
  toJson(input, flavor) {
    return flavor === "readable" ? {
      unix_millis: input.unixMillis,
      formatted: input.toDate().toISOString()
    } : input.unixMillis;
  }
  fromJson(json) {
    return Timestamp.fromUnixMillis(typeof json === "number" ? json : typeof json === "string" ? +json : json["unix_millis"]);
  }
  encode(input, stream) {
    const { unixMillis } = input;
    if (unixMillis) {
      stream.writeUint8(239);
      stream.writeInt64(BigInt(unixMillis));
    } else {
      stream.writeUint8(0);
    }
  }
  decode(stream) {
    const unixMillis = decodeNumber(stream);
    return Timestamp.fromUnixMillis(Number(unixMillis));
  }
  isDefault(input) {
    return !input.unixMillis;
  }
};
var StringSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "string";
    this.defaultValue = "";
  }
  toJson(input) {
    if (typeof input === "string") {
      return input;
    }
    throw this.newTypeError(input);
  }
  fromJson(json) {
    if (typeof json === "string") {
      return json;
    }
    if (json === 0) {
      return "";
    }
    throw this.newTypeError(json);
  }
  encode(input, stream) {
    if (!input) {
      stream.writeUint8(242);
      return;
    }
    stream.writeUint8(243);
    const maxEncodedLength = input.length * 3;
    if (maxEncodedLength < 232) {
      stream.writeUint8(0);
    } else if (maxEncodedLength < 65536) {
      stream.writeUint8(232);
      stream.writeUint16(0);
    } else {
      stream.writeUint8(233);
      stream.writeUint32(0);
    }
    const { dataView, offset } = stream;
    const encodedLength = stream.putUtf8String(input);
    if (maxEncodedLength < 232) {
      dataView.setUint8(offset - 1, encodedLength);
    } else if (maxEncodedLength < 65536) {
      dataView.setUint16(offset - 2, encodedLength, true);
    } else {
      dataView.setUint32(offset - 4, encodedLength, true);
    }
  }
  decode(stream) {
    const wire = stream.readUint8();
    if (wire === 0 || wire === 242) {
      return "";
    }
    const encodedLength = decodeNumber(stream);
    return textDecoder.decode(new Uint8Array(stream.buffer, (stream.offset += encodedLength) - encodedLength, encodedLength));
  }
  newTypeError(actual) {
    return new TypeError(`expected: string; actual: ${typeof actual}`);
  }
};
var ByteStringSerializer = class extends AbstractPrimitiveSerializer {
  constructor() {
    super(...arguments);
    this.primitive = "bytes";
    this.defaultValue = ByteString.EMPTY;
  }
  toJson(input, flavor) {
    return flavor === "readable" ? "hex:" + input.toBase16() : input.toBase64();
  }
  fromJson(json) {
    if (json === 0) {
      return ByteString.EMPTY;
    }
    const string = json;
    return string.startsWith("hex:") ? ByteString.fromBase16(string.substring(4)) : ByteString.fromBase64(string);
  }
  encode(input, stream) {
    const { byteLength } = input;
    if (byteLength) {
      stream.writeUint8(245);
      encodeUint32(byteLength, stream);
      stream.putBytes(input);
    } else {
      stream.writeUint8(244);
    }
  }
  decode(stream) {
    const wire = stream.readUint8();
    if (wire === 0 || wire === 244) {
      return ByteString.EMPTY;
    }
    const lengthInBytes = decodeNumber(stream);
    return ByteString.sliceOf(stream.buffer, stream.offset, stream.offset += lengthInBytes);
  }
  isDefault(input) {
    return !input.byteLength;
  }
};
var StructFieldImpl = class {
  constructor(name, property, number, serializer, doc) {
    this.name = name;
    this.property = property;
    this.number = number;
    this.serializer = serializer;
    this.doc = doc;
  }
  get type() {
    return this.serializer.typeDescriptor;
  }
  get(struct) {
    return Reflect.get(struct, this.property);
  }
  set(struct, value) {
    Reflect.set(struct, this.property, value);
  }
};
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();
var ArraySerializerImpl = class extends AbstractSerializer {
  constructor(itemSerializer, keyExtractor) {
    super();
    this.itemSerializer = itemSerializer;
    this.keyExtractor = keyExtractor;
    this.kind = "array";
    this.defaultValue = _EMPTY_ARRAY;
  }
  toJson(input, flavor) {
    return input.map((e) => this.itemSerializer.toJson(e, flavor));
  }
  fromJson(json, keep) {
    if (json === 0) {
      return _EMPTY_ARRAY;
    }
    return freezeArray(json.map((e) => this.itemSerializer.fromJson(e, keep)));
  }
  encode(input, stream) {
    const { length } = input;
    if (length <= 3) {
      stream.writeUint8(246 + length);
    } else {
      stream.writeUint8(250);
      encodeUint32(length, stream);
    }
    const { itemSerializer } = this;
    for (let i = 0; i < input.length; ++i) {
      itemSerializer.encode(input[i], stream);
    }
  }
  decode(stream) {
    const wire = stream.readUint8();
    if (wire === 0 || wire === 246) {
      return _EMPTY_ARRAY;
    }
    const length = wire === 250 ? decodeNumber(stream) : wire - 246;
    const { itemSerializer } = this;
    const result = new Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = itemSerializer.decode(stream);
    }
    return freezeArray(result);
  }
  isDefault(input) {
    return !input.length;
  }
  get itemType() {
    return this.itemSerializer.typeDescriptor;
  }
  get typeSignature() {
    return {
      kind: "array",
      value: {
        item: this.itemSerializer.typeSignature,
        key_extractor: this.keyExtractor
      }
    };
  }
  addRecordDefinitionsTo(out) {
    this.itemSerializer.addRecordDefinitionsTo(out);
  }
};
var OptionalSerializerImpl = class extends AbstractSerializer {
  constructor(otherSerializer) {
    super();
    this.otherSerializer = otherSerializer;
    this.kind = "optional";
    this.defaultValue = null;
  }
  toJson(input, flavor) {
    return input !== null ? this.otherSerializer.toJson(input, flavor) : null;
  }
  fromJson(json, keep) {
    return json !== null ? this.otherSerializer.fromJson(json, keep) : null;
  }
  encode(input, stream) {
    if (input === null) {
      stream.writeUint8(255);
    } else {
      this.otherSerializer.encode(input, stream);
    }
  }
  decode(stream) {
    const wire = stream.dataView.getUint8(stream.offset);
    if (wire === 255) {
      ++stream.offset;
      return null;
    }
    return this.otherSerializer.decode(stream);
  }
  isDefault(input) {
    return input === null;
  }
  get otherType() {
    return this.otherSerializer.typeDescriptor;
  }
  get typeSignature() {
    return {
      kind: "optional",
      value: this.otherSerializer.typeSignature
    };
  }
  addRecordDefinitionsTo(out) {
    this.otherSerializer.addRecordDefinitionsTo(out);
  }
};
var primitiveSerializers = {
  bool: new BoolSerializer(),
  int32: int32_Serializer,
  int64: new Int64Serializer(),
  hash64: new Hash64Serializer(),
  float32: new Float32Serializer(),
  float64: new Float64Serializer(),
  timestamp: new TimestampSerializer(),
  string: new StringSerializer(),
  bytes: new ByteStringSerializer()
};
function decodeUnused(stream) {
  const wire = stream.readUint8();
  if (wire < 232) {
    return;
  }
  switch (wire - 232) {
    case 0:
    // uint16
    case 4:
      stream.offset += 2;
      break;
    case 1:
    // uint32
    case 5:
    // int32
    case 8:
      stream.offset += 4;
      break;
    case 2:
    // hash64
    case 6:
    // int64
    case 7:
    // hash64 timestamp
    case 9:
      stream.offset += 8;
      break;
    case 3:
      ++stream.offset;
      break;
    case 11:
    // string
    case 13: {
      const length = decodeNumber(stream);
      stream.offset += length;
      break;
    }
    case 15:
    // array length==1
    case 19:
    // enum value kind==1
    case 20:
    // enum value kind==2
    case 21:
    // enum value kind==3
    case 22:
      decodeUnused(stream);
      break;
    case 16:
      decodeUnused(stream);
      decodeUnused(stream);
      break;
    case 17:
      decodeUnused(stream);
      decodeUnused(stream);
      decodeUnused(stream);
      break;
    case 18: {
      const length = decodeNumber(stream);
      for (let i = 0; i < length; ++i) {
        decodeUnused(stream);
      }
      break;
    }
  }
}
var AbstractRecordSerializer = class extends AbstractSerializer {
  constructor() {
    super(...arguments);
    this.token = Symbol();
    this.name = "";
    this.modulePath = "";
    this.doc = "";
    this.removedNumbers = /* @__PURE__ */ new Set();
  }
  init(name, modulePath, parentType, doc, fieldsOrVariants, removedNumbers) {
    this.name = name;
    this.modulePath = modulePath;
    this.parentType = parentType;
    this.doc = doc;
    this.removedNumbers = new Set(removedNumbers);
    this.registerFieldsOrVariants(fieldsOrVariants);
    this.initialized = true;
    freezeDeeply(this);
  }
  get qualifiedName() {
    const { name, parentType } = this;
    return parentType ? `${parentType.name}.${name}` : name;
  }
  addRecordDefinitionsTo(out) {
    const recordId = `${this.modulePath}:${this.qualifiedName}`;
    if (out[recordId]) {
      return;
    }
    const recordDefinition = this.makeRecordDefinition(recordId);
    if (this.doc) {
      recordDefinition.doc = this.doc;
    }
    if (this.removedNumbers.size) {
      recordDefinition.removed_numbers = [...this.removedNumbers];
    }
    out[recordId] = recordDefinition;
    for (const dependency of this.dependencies()) {
      dependency.addRecordDefinitionsTo(out);
    }
  }
};
var UnrecognizedFields = class {
  constructor(token, totalSlots, json, bytes) {
    this.token = token;
    this.totalSlots = totalSlots;
    this.json = json;
    this.bytes = bytes;
    Object.freeze(this);
  }
};
var StructSerializerImpl = class extends AbstractRecordSerializer {
  constructor(defaultValue, createFn, newMutableFn) {
    super();
    this.defaultValue = defaultValue;
    this.createFn = createFn;
    this.newMutableFn = newMutableFn;
    this.kind = "struct";
    this.fields = [];
    this.fieldMapping = {};
    this.reversedFields = [];
    this.slots = [];
    this.recognizedSlots = 0;
    this.zeros = [];
    this.initializerTemplate = {};
  }
  toJson(input, flavor) {
    if (input === this.defaultValue) {
      return flavor === "readable" ? {} : [];
    }
    if (flavor === "readable") {
      const { fields } = this;
      const result = {};
      for (const field of fields) {
        const { serializer } = field;
        const value = input[field.property];
        if (field.serializer.isDefault(value)) {
          continue;
        }
        result[field.name] = serializer.toJson(value, flavor);
      }
      return result;
    } else {
      const { slots } = this;
      let result;
      const unrecognizedFields = (
        //
        input["^"]
      );
      if (unrecognizedFields && unrecognizedFields.json && unrecognizedFields.token === this.token) {
        result = this.zeros.concat(unrecognizedFields.json);
        for (const field of this.fields) {
          result[field.number] = field.serializer.toJson(input[field.property], flavor);
        }
      } else {
        result = [];
        const arrayLength = this.getArrayLength(input);
        for (let i = 0; i < arrayLength; ++i) {
          const field = slots[i];
          result[i] = field ? field.serializer.toJson(input[field.property], flavor) : 0;
        }
      }
      return result;
    }
  }
  fromJson(json, keep) {
    if (!json) {
      return this.defaultValue;
    }
    const initializer = Object.assign({}, this.initializerTemplate);
    if (json instanceof Array) {
      const { slots, recognizedSlots } = this;
      if (json.length > recognizedSlots) {
        if (keep) {
          const unrecognizedFields = new UnrecognizedFields(this.token, json.length, copyJson(json.slice(recognizedSlots)));
          initializer["^"] = unrecognizedFields;
        }
        json = json.slice(0, recognizedSlots);
      }
      for (let i = 0; i < json.length && i < slots.length; ++i) {
        const field = slots[i];
        if (field) {
          initializer[field.property] = field.serializer.fromJson(json[i], keep);
        }
      }
      return this.createFn(initializer);
    } else if (json instanceof Object) {
      const { fieldMapping } = this;
      for (const name in json) {
        const field = fieldMapping[name];
        if (field) {
          initializer[field.property] = field.serializer.fromJson(json[name], keep);
        }
      }
      return this.createFn(initializer);
    }
    throw TypeError();
  }
  encode(input, stream) {
    let totalSlots;
    let recognizedSlots;
    let unrecognizedBytes;
    const unrecognizedFields = input["^"];
    if (unrecognizedFields && unrecognizedFields.bytes && unrecognizedFields.token === this.token) {
      totalSlots = unrecognizedFields.totalSlots;
      recognizedSlots = this.recognizedSlots;
      unrecognizedBytes = unrecognizedFields.bytes;
    } else {
      totalSlots = recognizedSlots = this.getArrayLength(input);
    }
    if (totalSlots <= 3) {
      stream.writeUint8(246 + totalSlots);
    } else {
      stream.writeUint8(250);
      encodeUint32(totalSlots, stream);
    }
    const { slots } = this;
    for (let i = 0; i < recognizedSlots; ++i) {
      const field = slots[i];
      if (field) {
        field.serializer.encode(input[field.property], stream);
      } else {
        stream.writeUint8(0);
      }
    }
    if (unrecognizedBytes) {
      stream.putBytes(unrecognizedBytes);
    }
  }
  decode(stream) {
    const wire = stream.readUint8();
    if (wire === 0 || wire === 246) {
      return this.defaultValue;
    }
    const initializer = Object.assign({}, this.initializerTemplate);
    const encodedSlots = wire === 250 ? decodeNumber(stream) : wire - 246;
    const { slots, recognizedSlots } = this;
    for (let i = 0; i < encodedSlots && i < recognizedSlots; ++i) {
      const field = slots[i];
      if (field) {
        initializer[field.property] = field.serializer.decode(stream);
      } else {
        decodeUnused(stream);
      }
    }
    if (encodedSlots > recognizedSlots) {
      const start = stream.offset;
      for (let i = recognizedSlots; i < encodedSlots; ++i) {
        decodeUnused(stream);
      }
      if (stream.keepUnrecognizedValues) {
        const end = stream.offset;
        const unrecognizedBytes = ByteString.sliceOf(stream.buffer, start, end);
        const unrecognizedFields = new UnrecognizedFields(this.token, encodedSlots, void 0, unrecognizedBytes);
        initializer["^"] = unrecognizedFields;
      }
    }
    return this.createFn(initializer);
  }
  /**
   * Returns the length of the JSON array for the given input, which is also the
   * number of slots and includes removed fields.
   * Assumes that `input` does not contain unrecognized fields.
   */
  getArrayLength(input) {
    const { reversedFields } = this;
    for (let i = 0; i < reversedFields.length; ++i) {
      const field = reversedFields[i];
      const isDefault = (
        //
        field.serializer.isDefault(input[field.property])
      );
      if (!isDefault) {
        return field.number + 1;
      }
    }
    return 0;
  }
  isDefault(input) {
    if (input === this.defaultValue) {
      return true;
    }
    if (input["^"]) {
      return false;
    }
    return this.fields.every((f) => f.serializer.isDefault(input[f.property]));
  }
  get typeSignature() {
    return {
      kind: "record",
      value: `${this.modulePath}:${this.qualifiedName}`
    };
  }
  getField(key) {
    return this.fieldMapping[key];
  }
  newMutable(initializer) {
    return this.newMutableFn(initializer);
  }
  registerFieldsOrVariants(fields) {
    for (const field of fields) {
      const { name, number, property } = field;
      this.fields.push(field);
      this.slots[number] = field;
      this.fieldMapping[name] = field;
      this.fieldMapping[property] = field;
      this.fieldMapping[number] = field;
      this.initializerTemplate[property] = this.defaultValue[field.property];
    }
    this.recognizedSlots = Math.max(this.slots.length - 1, ...this.removedNumbers) + 1;
    this.zeros.push(...Array(this.recognizedSlots).fill(0));
    this.reversedFields = [...this.fields].sort((a, b) => b.number - a.number);
  }
  makeRecordDefinition(recordId) {
    return {
      kind: "struct",
      id: recordId,
      doc: void 0,
      fields: this.fields.map((f) => ({
        name: f.name,
        number: f.number,
        type: f.serializer.typeSignature,
        doc: emptyToUndefined(f.doc)
      }))
    };
  }
  dependencies() {
    return this.fields.map((f) => f.serializer);
  }
};
var UnrecognizedEnum = class {
  constructor(token, json, bytes) {
    this.token = token;
    this.json = json;
    this.bytes = bytes;
    Object.freeze(this);
  }
};
var EnumWrapperVariantImpl = class {
  constructor(name, number, serializer, doc, createFn) {
    this.name = name;
    this.number = number;
    this.serializer = serializer;
    this.doc = doc;
    this.createFn = createFn;
  }
  get type() {
    return this.serializer.typeDescriptor;
  }
  get(e) {
    return e.kind === this.name ? e.value : void 0;
  }
  wrap(value) {
    return this.createFn({ kind: this.name, value });
  }
};
var EnumSerializerImpl = class extends AbstractRecordSerializer {
  constructor(createFn) {
    super();
    this.createFn = createFn;
    this.kind = "enum";
    this.variants = [];
    this.variantMapping = {};
    this.defaultValue = createFn("UNKNOWN");
  }
  toJson(input, flavor) {
    const unrecognized = input["^"];
    const kind = input.kind;
    if (kind === "UNKNOWN" && unrecognized && unrecognized.json && unrecognized.token === this.token) {
      return unrecognized.json;
    }
    if (kind === "UNKNOWN") {
      return flavor === "readable" ? "unknown" : 0;
    }
    const variant = this.variantMapping[kind];
    const { serializer } = variant;
    if (serializer) {
      const value = input.value;
      if (flavor === "readable") {
        return {
          kind: variant.name,
          value: serializer.toJson(value, flavor)
        };
      } else {
        return [variant.number, serializer.toJson(value, flavor)];
      }
    } else {
      return flavor === "readable" ? variant.name.toLowerCase() : variant.number;
    }
  }
  fromJson(json, keep) {
    const isNumber = typeof json === "number";
    if (isNumber || typeof json === "string") {
      const variant2 = this.variantMapping[isNumber ? json : String(json)];
      if (!variant2) {
        return !keep || isNumber && this.removedNumbers.has(json) ? this.defaultValue : this.createFn(new UnrecognizedEnum(this.token, copyJson(json)));
      }
      if (variant2.serializer) {
        return variant2.wrap(variant2.serializer.defaultValue);
      }
      return variant2.constant;
    }
    let variantKey;
    let valueAsJson;
    if (json instanceof Array) {
      variantKey = json[0];
      valueAsJson = json[1];
    } else if (json instanceof Object) {
      variantKey = json["kind"];
      valueAsJson = json["value"];
    } else {
      throw TypeError();
    }
    const variant = this.variantMapping[variantKey];
    if (!variant) {
      return !keep || typeof variantKey === "number" && this.removedNumbers.has(variantKey) ? this.defaultValue : this.createFn(new UnrecognizedEnum(this.token, copyJson(json), void 0));
    }
    const { serializer } = variant;
    if (!serializer) {
      return variant.constant;
    }
    return variant.wrap(serializer.fromJson(valueAsJson, keep));
  }
  encode(input, stream) {
    const unrecognized = (
      //
      input["^"]
    );
    const kind = input.kind;
    if (kind === "UNKNOWN" && unrecognized && unrecognized.bytes && unrecognized.token === this.token) {
      stream.putBytes(unrecognized.bytes);
      return;
    }
    if (kind === "UNKNOWN") {
      stream.writeUint8(0);
      return;
    }
    const variant = this.variantMapping[kind];
    const { number, serializer } = variant;
    if (serializer) {
      const value = input.value;
      if (number < 5) {
        stream.writeUint8(250 + number);
      } else {
        stream.writeUint8(248);
        encodeUint32(number, stream);
      }
      serializer.encode(value, stream);
    } else {
      encodeUint32(number, stream);
    }
  }
  decode(stream) {
    const startOffset = stream.offset;
    const wire = stream.dataView.getUint8(startOffset);
    if (wire < 242) {
      const number = decodeNumber(stream);
      const variant = this.variantMapping[number];
      if (!variant) {
        if (!stream.keepUnrecognizedValues || this.removedNumbers.has(number)) {
          return this.defaultValue;
        } else {
          const { offset } = stream;
          const bytes = ByteString.sliceOf(stream.buffer, startOffset, offset);
          return this.createFn(new UnrecognizedEnum(this.token, void 0, bytes));
        }
      }
      if (variant.serializer) {
        return variant.wrap(variant.serializer.defaultValue);
      }
      return variant.constant;
    } else {
      ++stream.offset;
      const number = wire === 248 ? decodeNumber(stream) : wire - 250;
      const variant = this.variantMapping[number];
      if (!variant) {
        decodeUnused(stream);
        if (!stream.keepUnrecognizedValues || this.removedNumbers.has(number)) {
          return this.defaultValue;
        } else {
          const { offset } = stream;
          const bytes = ByteString.sliceOf(stream.buffer, startOffset, offset);
          return this.createFn(new UnrecognizedEnum(this.token, void 0, bytes));
        }
      }
      const { serializer } = variant;
      if (!serializer) {
        decodeUnused(stream);
        return variant.constant;
      }
      return variant.wrap(serializer.decode(stream));
    }
  }
  get typeSignature() {
    return {
      kind: "record",
      value: `${this.modulePath}:${this.qualifiedName}`
    };
  }
  isDefault(input) {
    return input.kind === "UNKNOWN" && !input["^"];
  }
  getVariant(key) {
    return this.variantMapping[key];
  }
  registerFieldsOrVariants(variants) {
    for (const variant of variants) {
      this.variants.push(variant);
      this.variantMapping[variant.name] = variant;
      if (variant.serializer === void 0) {
        const nameUpper = variant.name.toUpperCase();
        if (nameUpper !== variant.name) {
          this.variantMapping[nameUpper] = variant;
        }
        const nameLower = variant.name.toLowerCase();
        if (nameLower !== variant.name) {
          this.variantMapping[nameLower] = variant;
        }
      }
      this.variantMapping[variant.number] = variant;
    }
  }
  makeRecordDefinition(recordId) {
    return {
      kind: "enum",
      id: recordId,
      doc: void 0,
      variants: this.variants.filter((f) => f.number).map((f) => {
        var _a;
        const result = {
          name: f.name.toLowerCase(),
          number: f.number,
          doc: emptyToUndefined(f.doc)
        };
        const type = (_a = f === null || f === void 0 ? void 0 : f.serializer) === null || _a === void 0 ? void 0 : _a.typeSignature;
        return type ? Object.assign(Object.assign({}, result), { type }) : result;
      })
    };
  }
  dependencies() {
    const result = [];
    for (const f of this.variants) {
      if (f.serializer) {
        result.push(f.serializer);
      }
    }
    return result;
  }
};
function copyJson(input) {
  if (input instanceof Array) {
    return Object.freeze(input.map(copyJson));
  } else if (input instanceof Object) {
    return Object.freeze(Object.fromEntries(Object.entries(input).map((k, v) => [k, copyJson(v)])));
  }
  return input;
}
function freezeDeeply(o) {
  if (!(o instanceof Object)) {
    return;
  }
  if (o instanceof _FrozenBase || o instanceof _EnumBase) {
    return;
  }
  if (o instanceof AbstractRecordSerializer && !o.initialized) {
    return;
  }
  if (Object.isFrozen(o)) {
    return;
  }
  Object.freeze(o);
  for (const v of Object.values(o)) {
    freezeDeeply(v);
  }
}
var frozenArrayRegistry = /* @__PURE__ */ new WeakMap();
function freezeArray(array) {
  if (!frozenArrayRegistry.has(array)) {
    frozenArrayRegistry.set(Object.freeze(array), {});
  }
  return array;
}
var _EMPTY_ARRAY = freezeArray([]);
function _toFrozenArray(initializers, itemToFrozenFn) {
  if (!initializers.length) {
    return _EMPTY_ARRAY;
  }
  if (frozenArrayRegistry.has(initializers)) {
    return initializers;
  }
  const ret = Object.freeze(itemToFrozenFn ? initializers.map(itemToFrozenFn) : initializers.slice());
  frozenArrayRegistry.set(ret, {});
  return ret;
}
var PRIVATE_KEY = Symbol();
function forPrivateUseError(t) {
  const clazz = Object.getPrototypeOf(t).constructor;
  const { qualifiedName } = clazz.serializer;
  return Error([
    "Do not call the constructor directly; ",
    `instead, call ${qualifiedName}.create(...)`
  ].join(""));
}
var _FrozenBase = class {
  constructor(privateKey) {
    if (privateKey !== PRIVATE_KEY) {
      throw forPrivateUseError(this);
    }
  }
  toMutable() {
    return new (Object.getPrototypeOf(this)).constructor.Mutable(this);
  }
  toFrozen() {
    return this;
  }
  toString() {
    return toStringImpl(this);
  }
};
var _EnumBase = class {
  constructor(privateKey, kind, value, unrecognized) {
    if (privateKey !== PRIVATE_KEY) {
      throw forPrivateUseError(this);
    }
    this.kind = kind;
    this.value = value;
    if (unrecognized) {
      if (!(unrecognized instanceof UnrecognizedEnum)) {
        throw new TypeError();
      }
      this["^"] = unrecognized;
    }
    Object.freeze(this);
  }
  toString() {
    return toStringImpl(this);
  }
};
Object.defineProperty(_EnumBase.prototype, "union", {
  get: function() {
    return this;
  }
});
function toStringImpl(value) {
  const serializer = Object.getPrototypeOf(value).constructor.serializer;
  return serializer.toJsonCode(value, "readable");
}
var UNKNOWN_VARIANT_SPEC = {
  name: "UNKNOWN",
  number: 0
};
function _initModuleClasses(modulePath, records) {
  var _a, _b, _c, _d, _f;
  const privateKey = PRIVATE_KEY;
  for (const record of records) {
    const clazz = record.ctor;
    switch (record.kind) {
      case "struct": {
        const { ctor, initFn } = record;
        clazz.DEFAULT = new ctor(privateKey);
        const mutableCtor = makeMutableClassForRecord(record, clazz.DEFAULT);
        clazz.Mutable = mutableCtor;
        const createFn = (initializer) => {
          if (initializer instanceof ctor) {
            return initializer;
          }
          const ret = new ctor(privateKey);
          initFn(ret, initializer);
          if (initializer["^"]) {
            ret["^"] = initializer["^"];
          }
          return Object.freeze(ret);
        };
        clazz.create = createFn;
        clazz.serializer = new StructSerializerImpl(clazz.DEFAULT, createFn, () => new mutableCtor());
        break;
      }
      case "enum": {
        record.variants = [UNKNOWN_VARIANT_SPEC].concat(record.variants);
        for (const variant of record.variants) {
          if (variant.type) {
            continue;
          }
          const property = variant.name;
          clazz[property] = new record.ctor(PRIVATE_KEY, variant.name);
        }
        const createFn = makeCreateEnumFunction(record);
        clazz.create = createFn;
        clazz.serializer = new EnumSerializerImpl(createFn);
        break;
      }
    }
    if (record.parentCtor) {
      record.parentCtor[record.name] = record.ctor;
    }
  }
  for (const record of records) {
    const clazz = record.ctor;
    const parentTypeDescriptor = (_a = record.parentCtor) === null || _a === void 0 ? void 0 : _a.serializer;
    switch (record.kind) {
      case "struct": {
        const fields = record.fields.map((f) => {
          var _a2;
          return new StructFieldImpl(f.name, f.property, f.number, getSerializerForType(f.type), (_a2 = f.doc) !== null && _a2 !== void 0 ? _a2 : "");
        });
        const serializer = clazz.serializer;
        serializer.init(record.name, modulePath, parentTypeDescriptor, (_b = record.doc) !== null && _b !== void 0 ? _b : "", fields, (_c = record.removedNumbers) !== null && _c !== void 0 ? _c : []);
        const { DEFAULT } = clazz;
        record.initFn(DEFAULT, {});
        Object.freeze(DEFAULT);
        const mutableCtor = clazz.Mutable;
        for (const field of record.fields) {
          if (field.mutableGetter) {
            Object.defineProperty(mutableCtor.prototype, field.mutableGetter, {
              get: makeMutableGetterFn(field)
            });
          }
        }
        for (const field of record.fields) {
          if (field.indexable) {
            record.ctor.prototype[field.indexable.searchMethod] = makeSearchMethod(field);
          }
        }
        Object.freeze(record.ctor);
        Object.freeze(record.ctor.prototype);
        Object.freeze(clazz.Mutable);
        Object.freeze(clazz.Mutable.prototype);
        break;
      }
      case "enum": {
        const serializer = clazz.serializer;
        const variants = record.variants.map((f) => {
          var _a2, _b2;
          return f.type ? new EnumWrapperVariantImpl(f.name, f.number, getSerializerForType(f.type), (_a2 = f.doc) !== null && _a2 !== void 0 ? _a2 : "", serializer.createFn) : {
            name: f.name,
            number: f.number,
            constant: clazz[f.name],
            doc: (_b2 = f.doc) !== null && _b2 !== void 0 ? _b2 : ""
          };
        });
        serializer.init(record.name, modulePath, parentTypeDescriptor, (_d = record.doc) !== null && _d !== void 0 ? _d : "", variants, (_f = record.removedNumbers) !== null && _f !== void 0 ? _f : []);
        Object.freeze(record.ctor);
        Object.freeze(record.ctor.prototype);
        break;
      }
    }
  }
}
function makeCreateEnumFunction(enumSpec) {
  const { ctor, createValueFn } = enumSpec;
  const createValue = createValueFn || (() => void 0);
  const privateKey = PRIVATE_KEY;
  return (initializer) => {
    if (initializer instanceof ctor) {
      return initializer;
    }
    if (typeof initializer === "string") {
      const maybeResult = ctor[initializer];
      if (maybeResult instanceof ctor) {
        return maybeResult;
      }
      throw new Error(`Constant not found: ${initializer}`);
    }
    if (initializer instanceof UnrecognizedEnum) {
      return new ctor(privateKey, "UNKNOWN", void 0, initializer);
    }
    const kind = initializer.kind;
    if (kind === void 0) {
      throw new Error("Missing entry: kind");
    }
    const unrecognized = initializer["^"];
    const value = createValue(initializer);
    if (value === void 0) {
      const maybeConstant = ctor[kind];
      if (!(maybeConstant instanceof ctor)) {
        throw new Error(`Wrapper variant not found: ${kind}`);
      }
      return unrecognized ? new ctor(privateKey, kind, void 0, unrecognized) : maybeConstant;
    }
    return new ctor(privateKey, kind, value, unrecognized);
  };
}
function makeMutableClassForRecord(structSpec, defaultFrozen) {
  const { ctor: frozenCtor, initFn } = structSpec;
  const frozenClass = frozenCtor;
  class Mutable {
    constructor(initializer = defaultFrozen) {
      initFn(this, initializer);
      if (initializer["^"]) {
        this["^"] = initializer["^"];
      }
      Object.seal(this);
    }
    toFrozen() {
      return frozenClass.create(this);
    }
    toString() {
      const serializer = frozenClass.serializer;
      return serializer.toJsonCode(this, "readable");
    }
  }
  return Mutable;
}
function getSerializerForType(type) {
  switch (type.kind) {
    case "array":
      return arraySerializer(getSerializerForType(type.item), type.keyChain);
    case "optional":
      return optionalSerializer(getSerializerForType(type.other));
    case "primitive":
      return primitiveSerializer(type.primitive);
    case "record":
      return type.ctor.serializer;
  }
}
var arraysReturnedByMutableGetters = /* @__PURE__ */ new WeakMap();
function makeMutableGetterFn(field) {
  const { property, type } = field;
  switch (type.kind) {
    case "array": {
      class Class {
        static ret() {
          const value = this[property];
          if (arraysReturnedByMutableGetters.get(value) === this) {
            return value;
          }
          const copy = [...value];
          arraysReturnedByMutableGetters.set(copy, this);
          return this[property] = copy;
        }
      }
      return Class.ret;
    }
    case "record": {
      const mutableCtor = type.ctor.Mutable;
      class Class {
        static ret() {
          const value = this[property];
          if (value instanceof mutableCtor) {
            return value;
          }
          return this[property] = new mutableCtor(value);
        }
      }
      return Class.ret;
    }
    default: {
      throw new Error();
    }
  }
}
function makeSearchMethod(field) {
  var _a;
  const { property } = field;
  const indexable = field.indexable;
  const { keyFn } = indexable;
  const keyToHashable = (_a = indexable.keyToHashable) !== null && _a !== void 0 ? _a : ((e) => e);
  class Class {
    ret(key) {
      const array = this[property];
      const frozenArrayInfo = frozenArrayRegistry.get(array);
      let { keyFnToIndexing } = frozenArrayInfo;
      if (!keyFnToIndexing) {
        frozenArrayInfo.keyFnToIndexing = keyFnToIndexing = //
        /* @__PURE__ */ new Map();
      }
      let hashableToValue = keyFnToIndexing.get(keyFn);
      if (!hashableToValue) {
        hashableToValue = /* @__PURE__ */ new Map();
        for (const v of array) {
          const hashable = keyToHashable(keyFn(v));
          hashableToValue.set(hashable, v);
        }
        keyFnToIndexing.set(keyFn, hashableToValue);
      }
      return hashableToValue.get(keyToHashable(key));
    }
  }
  return Class.prototype.ret;
}
function emptyToUndefined(str) {
  return str ? str : void 0;
}

// ../.cache/sdk/generated/typescript/skirout/geometry.js
var Rect = class extends _FrozenBase {
};
function initRect(target, initializer) {
  target.x = initializer.x ?? 0;
  target.y = initializer.y ?? 0;
  target.width = initializer.width ?? 0;
  target.height = initializer.height ?? 0;
}
var Size = class extends _FrozenBase {
};
function initSize(target, initializer) {
  target.width = initializer.width ?? 0;
  target.height = initializer.height ?? 0;
}
_initModuleClasses(
  "geometry.skir",
  [
    {
      kind: "struct",
      ctor: Rect,
      initFn: initRect,
      name: "Rect",
      fields: [
        {
          name: "x",
          property: "x",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        },
        {
          name: "y",
          property: "y",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        },
        {
          name: "width",
          property: "width",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        },
        {
          name: "height",
          property: "height",
          number: 3,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Size,
      initFn: initSize,
      name: "Size",
      fields: [
        {
          name: "width",
          property: "width",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        },
        {
          name: "height",
          property: "height",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "float64"
          }
        }
      ]
    }
  ]
);

// ../.cache/sdk/generated/typescript/skirout/runtime_model.js
var Lifecycle = class extends _EnumBase {
};
var Presentation = class extends _EnumBase {
};
var Capabilities = class extends _FrozenBase {
};
function initCapabilities(target, initializer) {
  target.movable = initializer.movable ?? false;
  target.resizable = initializer.resizable ?? false;
  target.closable = initializer.closable ?? false;
  target.minimizable = initializer.minimizable ?? false;
  target.maximizable = initializer.maximizable ?? false;
}
var AppDefinition = class extends _FrozenBase {
};
function initAppDefinition(target, initializer) {
  target.id = initializer.id ?? "";
  target.displayName = initializer.displayName ?? "";
  target.multipleInstances = initializer.multipleInstances ?? false;
  target.preferredSize = Size.create(initializer.preferredSize ?? Size.DEFAULT);
  target.minimumSize = Size.create(initializer.minimumSize ?? Size.DEFAULT);
  target.capabilities = Capabilities.create(initializer.capabilities ?? Capabilities.DEFAULT);
}
var AppInstance = class extends _FrozenBase {
};
function initAppInstance(target, initializer) {
  target.id = initializer.id ?? "";
  target.definitionId = initializer.definitionId ?? "";
  target.workspaceId = initializer.workspaceId ?? "";
  target.lifecycle = Lifecycle.create(initializer.lifecycle ?? Lifecycle.UNKNOWN);
  target.windowIds = _toFrozenArray(
    initializer.windowIds || []
  );
}
var WindowInstance = class extends _FrozenBase {
};
function initWindowInstance(target, initializer) {
  target.id = initializer.id ?? "";
  target.appInstanceId = initializer.appInstanceId ?? "";
  target.workspaceId = initializer.workspaceId ?? "";
  target.title = initializer.title ?? "";
  target.bounds = Rect.create(initializer.bounds ?? Rect.DEFAULT);
  target.restoredBounds = initializer.restoredBounds ? Rect.create(initializer.restoredBounds) : null;
  target.visible = initializer.visible ?? false;
  target.presentation = Presentation.create(initializer.presentation ?? Presentation.UNKNOWN);
  target.capabilities = Capabilities.create(initializer.capabilities ?? Capabilities.DEFAULT);
  target.revision = initializer.revision ?? BigInt(0);
}
var Workspace = class extends _FrozenBase {
};
function initWorkspace(target, initializer) {
  target.id = initializer.id ?? "";
  target.appInstanceIds = _toFrozenArray(
    initializer.appInstanceIds || []
  );
  target.windowIds = _toFrozenArray(
    initializer.windowIds || []
  );
  target.focusedWindowId = initializer.focusedWindowId ?? null;
  target.revision = initializer.revision ?? BigInt(0);
}
var Snapshot = class extends _FrozenBase {
};
function initSnapshot(target, initializer) {
  target.definitions = _toFrozenArray(
    initializer.definitions || [],
    AppDefinition.create
  );
  target.apps = _toFrozenArray(
    initializer.apps || [],
    AppInstance.create
  );
  target.windows = _toFrozenArray(
    initializer.windows || [],
    WindowInstance.create
  );
  target.workspaces = _toFrozenArray(
    initializer.workspaces || [],
    Workspace.create
  );
  target.revision = initializer.revision ?? BigInt(0);
}
var ShellKind = class extends _EnumBase {
};
var ShellContribution = class extends _FrozenBase {
};
function initShellContribution(target, initializer) {
  target.id = initializer.id ?? "";
  target.appInstanceId = initializer.appInstanceId ?? "";
  target.kind = ShellKind.create(initializer.kind ?? ShellKind.UNKNOWN);
  target.label = initializer.label ?? "";
}
_initModuleClasses(
  "runtime_model.skir",
  [
    {
      kind: "enum",
      ctor: Lifecycle,
      name: "Lifecycle",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "RUNNING",
          number: 1
        },
        {
          name: "SUSPENDED",
          number: 2
        },
        {
          name: "STOPPED",
          number: 3
        }
      ]
    },
    {
      kind: "enum",
      ctor: Presentation,
      name: "Presentation",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "NORMAL",
          number: 1
        },
        {
          name: "MINIMIZED",
          number: 2
        },
        {
          name: "MAXIMIZED",
          number: 3
        }
      ]
    },
    {
      kind: "struct",
      ctor: Capabilities,
      initFn: initCapabilities,
      name: "Capabilities",
      fields: [
        {
          name: "movable",
          property: "movable",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "resizable",
          property: "resizable",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "closable",
          property: "closable",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "minimizable",
          property: "minimizable",
          number: 3,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "maximizable",
          property: "maximizable",
          number: 4,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: AppDefinition,
      initFn: initAppDefinition,
      name: "AppDefinition",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "display_name",
          property: "displayName",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "multiple_instances",
          property: "multipleInstances",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "preferred_size",
          property: "preferredSize",
          number: 3,
          type: {
            kind: "record",
            ctor: Size
          },
          mutableGetter: "mutablePreferredSize"
        },
        {
          name: "minimum_size",
          property: "minimumSize",
          number: 4,
          type: {
            kind: "record",
            ctor: Size
          },
          mutableGetter: "mutableMinimumSize"
        },
        {
          name: "capabilities",
          property: "capabilities",
          number: 5,
          type: {
            kind: "record",
            ctor: Capabilities
          },
          mutableGetter: "mutableCapabilities"
        }
      ]
    },
    {
      kind: "struct",
      ctor: AppInstance,
      initFn: initAppInstance,
      name: "AppInstance",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "definition_id",
          property: "definitionId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "workspace_id",
          property: "workspaceId",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "lifecycle",
          property: "lifecycle",
          number: 3,
          type: {
            kind: "record",
            ctor: Lifecycle
          }
        },
        {
          name: "window_ids",
          property: "windowIds",
          number: 4,
          type: {
            kind: "array",
            item: {
              kind: "primitive",
              primitive: "string"
            }
          },
          mutableGetter: "mutableWindowIds"
        }
      ]
    },
    {
      kind: "struct",
      ctor: WindowInstance,
      initFn: initWindowInstance,
      name: "WindowInstance",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "app_instance_id",
          property: "appInstanceId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "workspace_id",
          property: "workspaceId",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "title",
          property: "title",
          number: 3,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "bounds",
          property: "bounds",
          number: 4,
          type: {
            kind: "record",
            ctor: Rect
          },
          mutableGetter: "mutableBounds"
        },
        {
          name: "restored_bounds",
          property: "restoredBounds",
          number: 5,
          type: {
            kind: "optional",
            other: {
              kind: "record",
              ctor: Rect
            }
          }
        },
        {
          name: "visible",
          property: "visible",
          number: 6,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        },
        {
          name: "presentation",
          property: "presentation",
          number: 7,
          type: {
            kind: "record",
            ctor: Presentation
          }
        },
        {
          name: "capabilities",
          property: "capabilities",
          number: 8,
          type: {
            kind: "record",
            ctor: Capabilities
          },
          mutableGetter: "mutableCapabilities"
        },
        {
          name: "revision",
          property: "revision",
          number: 9,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Workspace,
      initFn: initWorkspace,
      name: "Workspace",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "app_instance_ids",
          property: "appInstanceIds",
          number: 1,
          type: {
            kind: "array",
            item: {
              kind: "primitive",
              primitive: "string"
            }
          },
          mutableGetter: "mutableAppInstanceIds"
        },
        {
          name: "window_ids",
          property: "windowIds",
          number: 2,
          type: {
            kind: "array",
            item: {
              kind: "primitive",
              primitive: "string"
            }
          },
          mutableGetter: "mutableWindowIds"
        },
        {
          name: "focused_window_id",
          property: "focusedWindowId",
          number: 3,
          type: {
            kind: "optional",
            other: {
              kind: "primitive",
              primitive: "string"
            }
          }
        },
        {
          name: "revision",
          property: "revision",
          number: 4,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Snapshot,
      initFn: initSnapshot,
      name: "Snapshot",
      fields: [
        {
          name: "definitions",
          property: "definitions",
          number: 0,
          type: {
            kind: "array",
            item: {
              kind: "record",
              ctor: AppDefinition
            }
          },
          mutableGetter: "mutableDefinitions"
        },
        {
          name: "apps",
          property: "apps",
          number: 1,
          type: {
            kind: "array",
            item: {
              kind: "record",
              ctor: AppInstance
            }
          },
          mutableGetter: "mutableApps"
        },
        {
          name: "windows",
          property: "windows",
          number: 2,
          type: {
            kind: "array",
            item: {
              kind: "record",
              ctor: WindowInstance
            }
          },
          mutableGetter: "mutableWindows"
        },
        {
          name: "workspaces",
          property: "workspaces",
          number: 3,
          type: {
            kind: "array",
            item: {
              kind: "record",
              ctor: Workspace
            }
          },
          mutableGetter: "mutableWorkspaces"
        },
        {
          name: "revision",
          property: "revision",
          number: 4,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        }
      ]
    },
    {
      kind: "enum",
      ctor: ShellKind,
      name: "ShellKind",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "TASKBAR",
          number: 1
        },
        {
          name: "TRAY",
          number: 2
        },
        {
          name: "STATUS",
          number: 3
        }
      ]
    },
    {
      kind: "struct",
      ctor: ShellContribution,
      initFn: initShellContribution,
      name: "ShellContribution",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "app_instance_id",
          property: "appInstanceId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "kind",
          property: "kind",
          number: 2,
          type: {
            kind: "record",
            ctor: ShellKind
          }
        },
        {
          name: "label",
          property: "label",
          number: 3,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        }
      ]
    }
  ]
);

// ../.cache/sdk/generated/typescript/skirout/runtime_protocol.js
var BoundsChange = class extends _FrozenBase {
};
function initBoundsChange(target, initializer) {
  target.windowId = initializer.windowId ?? "";
  target.bounds = Rect.create(initializer.bounds ?? Rect.DEFAULT);
}
var VisibilityChange = class extends _FrozenBase {
};
function initVisibilityChange(target, initializer) {
  target.windowId = initializer.windowId ?? "";
  target.visible = initializer.visible ?? false;
}
var PresentationChange = class extends _FrozenBase {
};
function initPresentationChange(target, initializer) {
  target.windowId = initializer.windowId ?? "";
  target.presentation = Presentation.create(initializer.presentation ?? Presentation.UNKNOWN);
}
var LifecycleChange = class extends _FrozenBase {
};
function initLifecycleChange(target, initializer) {
  target.appInstanceId = initializer.appInstanceId ?? "";
  target.lifecycle = Lifecycle.create(initializer.lifecycle ?? Lifecycle.UNKNOWN);
}
var WorkspaceMove = class extends _FrozenBase {
};
function initWorkspaceMove(target, initializer) {
  target.appInstanceId = initializer.appInstanceId ?? "";
  target.workspaceId = initializer.workspaceId ?? "";
}
var OrderChange = class extends _FrozenBase {
};
function initOrderChange(target, initializer) {
  target.workspaceId = initializer.workspaceId ?? "";
  target.windowIds = _toFrozenArray(
    initializer.windowIds || []
  );
}
var CommandPayload = class extends _EnumBase {
};
function createValueOfCommandPayload(initializer) {
  const { kind, value } = initializer;
  switch (kind) {
    case "register_definition": {
      return AppDefinition.create(value);
    }
    case "unregister_definition": {
      return value;
    }
    case "create_workspace": {
      return Workspace.create(value);
    }
    case "create_app": {
      return AppInstance.create(value);
    }
    case "dispose_app": {
      return value;
    }
    case "attach_window": {
      return WindowInstance.create(value);
    }
    case "detach_window": {
      return value;
    }
    case "set_bounds": {
      return BoundsChange.create(value);
    }
    case "set_visibility": {
      return VisibilityChange.create(value);
    }
    case "focus_window": {
      return value;
    }
    case "set_order": {
      return OrderChange.create(value);
    }
    case "set_presentation": {
      return PresentationChange.create(value);
    }
    case "set_lifecycle": {
      return LifecycleChange.create(value);
    }
    case "move_workspace": {
      return WorkspaceMove.create(value);
    }
    case "set_shell_contribution": {
      return ShellContribution.create(value);
    }
  }
}
var Command = class extends _FrozenBase {
};
function initCommand(target, initializer) {
  target.id = initializer.id ?? "";
  target.aggregateId = initializer.aggregateId ?? "";
  target.expectedRevision = initializer.expectedRevision ?? BigInt(0);
  target.payload = CommandPayload.create(initializer.payload ?? CommandPayload.UNKNOWN);
}
var RejectionCode = class extends _EnumBase {
};
var Rejection = class extends _FrozenBase {
};
function initRejection(target, initializer) {
  target.code = RejectionCode.create(initializer.code ?? RejectionCode.UNKNOWN);
  target.message = initializer.message ?? "";
  target.currentRevision = initializer.currentRevision ?? BigInt(0);
}
var Event = class extends _FrozenBase {
};
function initEvent(target, initializer) {
  target.id = initializer.id ?? "";
  target.commandId = initializer.commandId ?? "";
  target.aggregateId = initializer.aggregateId ?? "";
  target.revision = initializer.revision ?? BigInt(0);
  target.payload = CommandPayload.create(initializer.payload ?? CommandPayload.UNKNOWN);
}
var Accepted = class extends _FrozenBase {
};
function initAccepted(target, initializer) {
  target.snapshot = Snapshot.create(initializer.snapshot ?? Snapshot.DEFAULT);
  target.events = _toFrozenArray(
    initializer.events || [],
    Event.create
  );
}
var Result = class extends _EnumBase {
};
function createValueOfResult(initializer) {
  const { kind, value } = initializer;
  switch (kind) {
    case "accepted": {
      return Accepted.create(value);
    }
    case "rejected": {
      return Rejection.create(value);
    }
  }
}
_initModuleClasses(
  "runtime_protocol.skir",
  [
    {
      kind: "struct",
      ctor: BoundsChange,
      initFn: initBoundsChange,
      name: "BoundsChange",
      fields: [
        {
          name: "window_id",
          property: "windowId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "bounds",
          property: "bounds",
          number: 1,
          type: {
            kind: "record",
            ctor: Rect
          },
          mutableGetter: "mutableBounds"
        }
      ]
    },
    {
      kind: "struct",
      ctor: VisibilityChange,
      initFn: initVisibilityChange,
      name: "VisibilityChange",
      fields: [
        {
          name: "window_id",
          property: "windowId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "visible",
          property: "visible",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "bool"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: PresentationChange,
      initFn: initPresentationChange,
      name: "PresentationChange",
      fields: [
        {
          name: "window_id",
          property: "windowId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "presentation",
          property: "presentation",
          number: 1,
          type: {
            kind: "record",
            ctor: Presentation
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: LifecycleChange,
      initFn: initLifecycleChange,
      name: "LifecycleChange",
      fields: [
        {
          name: "app_instance_id",
          property: "appInstanceId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "lifecycle",
          property: "lifecycle",
          number: 1,
          type: {
            kind: "record",
            ctor: Lifecycle
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: WorkspaceMove,
      initFn: initWorkspaceMove,
      name: "WorkspaceMove",
      fields: [
        {
          name: "app_instance_id",
          property: "appInstanceId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "workspace_id",
          property: "workspaceId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: OrderChange,
      initFn: initOrderChange,
      name: "OrderChange",
      fields: [
        {
          name: "workspace_id",
          property: "workspaceId",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "window_ids",
          property: "windowIds",
          number: 1,
          type: {
            kind: "array",
            item: {
              kind: "primitive",
              primitive: "string"
            }
          },
          mutableGetter: "mutableWindowIds"
        }
      ]
    },
    {
      kind: "enum",
      ctor: CommandPayload,
      createValueFn: createValueOfCommandPayload,
      name: "CommandPayload",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "register_definition",
          number: 1,
          type: {
            kind: "record",
            ctor: AppDefinition
          }
        },
        {
          name: "unregister_definition",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "create_workspace",
          number: 3,
          type: {
            kind: "record",
            ctor: Workspace
          }
        },
        {
          name: "create_app",
          number: 4,
          type: {
            kind: "record",
            ctor: AppInstance
          }
        },
        {
          name: "dispose_app",
          number: 5,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "attach_window",
          number: 6,
          type: {
            kind: "record",
            ctor: WindowInstance
          }
        },
        {
          name: "detach_window",
          number: 7,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "set_bounds",
          number: 8,
          type: {
            kind: "record",
            ctor: BoundsChange
          }
        },
        {
          name: "set_visibility",
          number: 9,
          type: {
            kind: "record",
            ctor: VisibilityChange
          }
        },
        {
          name: "focus_window",
          number: 10,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "set_order",
          number: 11,
          type: {
            kind: "record",
            ctor: OrderChange
          }
        },
        {
          name: "set_presentation",
          number: 12,
          type: {
            kind: "record",
            ctor: PresentationChange
          }
        },
        {
          name: "set_lifecycle",
          number: 13,
          type: {
            kind: "record",
            ctor: LifecycleChange
          }
        },
        {
          name: "move_workspace",
          number: 14,
          type: {
            kind: "record",
            ctor: WorkspaceMove
          }
        },
        {
          name: "set_shell_contribution",
          number: 15,
          type: {
            kind: "record",
            ctor: ShellContribution
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Command,
      initFn: initCommand,
      name: "Command",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "aggregate_id",
          property: "aggregateId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "expected_revision",
          property: "expectedRevision",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        },
        {
          name: "payload",
          property: "payload",
          number: 3,
          type: {
            kind: "record",
            ctor: CommandPayload
          }
        }
      ]
    },
    {
      kind: "enum",
      ctor: RejectionCode,
      name: "RejectionCode",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "INVALID",
          number: 1
        },
        {
          name: "NOT_FOUND",
          number: 2
        },
        {
          name: "CONFLICT",
          number: 3
        },
        {
          name: "UNSUPPORTED",
          number: 4
        }
      ]
    },
    {
      kind: "struct",
      ctor: Rejection,
      initFn: initRejection,
      name: "Rejection",
      fields: [
        {
          name: "code",
          property: "code",
          number: 0,
          type: {
            kind: "record",
            ctor: RejectionCode
          }
        },
        {
          name: "message",
          property: "message",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "current_revision",
          property: "currentRevision",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Event,
      initFn: initEvent,
      name: "Event",
      fields: [
        {
          name: "id",
          property: "id",
          number: 0,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "command_id",
          property: "commandId",
          number: 1,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "aggregate_id",
          property: "aggregateId",
          number: 2,
          type: {
            kind: "primitive",
            primitive: "string"
          }
        },
        {
          name: "revision",
          property: "revision",
          number: 3,
          type: {
            kind: "primitive",
            primitive: "int64"
          }
        },
        {
          name: "payload",
          property: "payload",
          number: 4,
          type: {
            kind: "record",
            ctor: CommandPayload
          }
        }
      ]
    },
    {
      kind: "struct",
      ctor: Accepted,
      initFn: initAccepted,
      name: "Accepted",
      fields: [
        {
          name: "snapshot",
          property: "snapshot",
          number: 0,
          type: {
            kind: "record",
            ctor: Snapshot
          },
          mutableGetter: "mutableSnapshot"
        },
        {
          name: "events",
          property: "events",
          number: 1,
          type: {
            kind: "array",
            item: {
              kind: "record",
              ctor: Event
            }
          },
          mutableGetter: "mutableEvents"
        }
      ]
    },
    {
      kind: "enum",
      ctor: Result,
      createValueFn: createValueOfResult,
      name: "Result",
      variants: [
        {
          name: "UNKNOWN",
          number: 0
        },
        {
          name: "accepted",
          number: 1,
          type: {
            kind: "record",
            ctor: Accepted
          }
        },
        {
          name: "rejected",
          number: 2,
          type: {
            kind: "record",
            ctor: Rejection
          }
        }
      ]
    }
  ]
);

// ../.cache/sdk/typescript/wasm.ts
async function createReducer(bytes) {
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const wasm = instance.exports;
  const encode = new TextEncoder();
  const decode = new TextDecoder();
  return (aggregateId, snapshot, command) => {
    const input = encode.encode(`{"aggregate_id":${JSON.stringify(aggregateId)},"snapshot":${Snapshot.serializer.toJsonCode(snapshot, "readable")},"command":${Command.serializer.toJsonCode(command, "readable")}}`);
    const pointer = wasm.allocate(input.length);
    let resultPointer = 0;
    let resultLength = 0;
    try {
      new Uint8Array(wasm.memory.buffer, pointer, input.length).set(input);
      const packed = wasm.reduce_buffer(pointer, input.length);
      resultPointer = Number(packed & 0xffffffffn);
      resultLength = Number(packed >> 32n);
      const text = decode.decode(new Uint8Array(wasm.memory.buffer, resultPointer, resultLength));
      const error = JSON.parse(text).bridge_error;
      if (error) throw new Error(`Runtime bridge input rejected: ${error}`);
      return Result.serializer.fromJsonCode(text);
    } finally {
      wasm.release(pointer, input.length);
      if (resultLength) wasm.release(resultPointer, resultLength);
    }
  };
}
export {
  Command,
  Snapshot,
  createReducer
};
