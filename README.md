# JSON parser wrapper
Simple wrapper for ```JSON.parse()``` with the option to set default data type, in case of parse error (e.g. empty string).

# Installation
```npm install @krisell/parser```

# How to use
```Parser.json(stringifiedData)```  will return ```{}``` if ```stringifiedData``` can't be parsed, whereas ```Parser.json(stringifiedData, 'array')``` will return ```[]```. 

The data and type settings can also be provided with an options object.

```JavaScript
Parser.json({
    serialized: stringifiedData,
    type: 'array'
})
```

That's all there is to it.
