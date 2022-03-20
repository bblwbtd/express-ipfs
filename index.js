import express from 'express'
import fileUpload from 'express-fileupload'
import { create } from 'ipfs-http-client'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import { createReadStream } from 'fs'


const app = express()
const IPFSclient = create()

// Use file upload middleware
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: true
}))

app.post('/ipfs/upload', async (req, res) => {
    try{ 
        // The file upload middleware has save the file for us. We just create a read steam for IPFS http client.
        const resp = await IPFSclient.add({
            content: createReadStream(req.files.record.tempFilePath)
        })
        // Return cid once finish adding.
        res.status(200).send(resp.cid.toString()) 
    }catch(e) {
        res.status(500).send("Server error.")
    }  
})

app.get('/ipfs/get', async (req, res) => {
    try {
        // Cat the file according to the cid.
        const cid = req.query.cid
        for await (const buf of IPFSclient.cat(cid)) {
            res.write(buf)
        }
        res.status(200).end()
    }catch(e) {
        res.status(500).send("Server error.")
    }

})

const indexPath = join(dirname(fileURLToPath(import.meta.url)), 'static', 'index.html')
app.get('/', (req, res) => {
    res.sendFile(indexPath)
})


app.listen(2022, () => {
    console.log("Server started! Visit: http://127.0.0.1:2022" )
})

