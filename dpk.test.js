const { deterministicPartitionKey } = require("./dpk");
const crypto = require('crypto');


describe("deterministicPartitionKey", () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it("Returns the literal '0' when given no input", () => {
    const trivialKey = deterministicPartitionKey();
    expect(trivialKey).toBe("0");
  });

  it("Returns the partitionKey of event if it exists", ()=>{
    const event = {partitionKey:"Event Partition Key"}
    const eventPartitionKey = deterministicPartitionKey(event)
    expect(eventPartitionKey).toBe(event.partitionKey);
  });

  it("Returns the string partitionKey of event if it is not string", ()=>{
    const hashMock = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValueOnce('encrypt 123'),
    };
    jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => hashMock);
    const event = {partitionKey:[]}
    const eventPartitionKey = deterministicPartitionKey(event)        
    expect(typeof eventPartitionKey).toBe("string")
  });

  it("Returns the created crypto hashed partitionKey if partitionKey doesn't exist in event", ()=>{
    const hashMock = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValueOnce('encrypted hash value'),
    };
    jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => hashMock);    
    const event = {}
    const eventPartitionKey = deterministicPartitionKey(event)        
    expect(eventPartitionKey).toBe("encrypted hash value")
    
  });

  it("Returns the created crypto hashed partitionKey if partitionKey's length is bigger than MAX_PARTITION_KEY_LENGTH", ()=>{
    const hashMock = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValueOnce('encrypt 123'),
    };
    jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => hashMock);
    const event = {partitionKey:'key'.repeat(100)}
    const eventPartitionKey = deterministicPartitionKey(event)    
    expect(eventPartitionKey).toBe("encrypt 123")
    expect(eventPartitionKey.length).toBeLessThanOrEqual(256)
  });
});
