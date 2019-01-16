import RawXHR from '../lib/index.js'

describe('XHR calls', () => {
    const oldXMLHttpRequest = window.XMLHttpRequest;
    let mockXHR

    afterEach(() => {
        window.XMLHttpRequest = oldXMLHttpRequest
    })

    beforeEach(() => {
        mockXHR = {
            open: jest.fn(),
            send: jest.fn(),
            setRequestHeader: jest.fn(),
            status: 200,
            readyState: 4,
            responseText: JSON.stringify(
                [
                    { title: 'test post' },
                    { tile: 'second test post' }
                ]
            )
        }
        const oldXMLHttpRequest = window.XMLHttpRequest
        window.XMLHttpRequest = jest.fn(() => mockXHR)

        window.XMLHttpRequest.DONE = 4
    })

    test('it is a function', () => {
        expect(typeof RawXHR).toBe('function')
    })

    test('can make a simple GET request', () => {
        ;(new RawXHR('google.com')).send()
        expect(mockXHR.open).toHaveBeenCalledWith('get', 'google.com')

        ;(new RawXHR({ url: 'google2.com' })).send()
        expect(mockXHR.open).toHaveBeenCalledWith('get', 'google2.com')
    })

    test('can specify HTTP verb', () => {
        ;(new RawXHR('martin.se', 'get')).send()
        expect(mockXHR.open).toHaveBeenCalledWith('get', 'martin.se')

        ;(new RawXHR('martin.se', 'post')).send()
        expect(mockXHR.open).toHaveBeenCalledWith('post', 'martin.se')

        ;(new RawXHR('martin.se', { method: 'put' })).send()
        expect(mockXHR.open).toHaveBeenCalledWith('put', 'martin.se')

        ;(new RawXHR({ url: 'martin.se', method: 'patch' })).send()
        expect(mockXHR.open).toHaveBeenCalledWith('patch', 'martin.se')
    })

    test('JSON is converted to an object', () => {
        let req = new RawXHR('/api')

        mockXHR.response = JSON.stringify({ a: 2 })

        let prom = req.send()
        mockXHR.onreadystatechange()

        expect.assertions(1)
        return prom.then(data => {
            expect(data).toEqual({ a: 2 })
        })
    })

    test('Non-json is returned as a string', () => {
        let req = new RawXHR('/api', { responseType: 'text' })

        mockXHR.response = JSON.stringify({ a: 2 })

        let prom = req.send()
        mockXHR.onreadystatechange()

        expect.assertions(1)
        return prom.then(data => {
            expect(data).toEqual(JSON.stringify({ a: 2 }))
        })
    })

    test('Post data is sent correctly', () => {
        let req = new RawXHR('/api', 'post')

        mockXHR.response = JSON.stringify({ a: 2 })

        let prom = req.send({ my: 'data', is: 'here', more: 1 })
        mockXHR.onreadystatechange()

        expect(mockXHR.setRequestHeader).toHaveBeenCalledWith("Content-type", "application/x-www-form-urlencoded; charset=UTF-8")
        expect(mockXHR.send).toHaveBeenCalledWith('my=data&is=here&more=1')
    })
})