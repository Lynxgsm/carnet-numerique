import React, { useState } from "react";
import axios from 'axios'
import { url } from "./url";

export default function Bill() {
    const [file, setFile] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const uploadImage = (e) => {
        e.preventDefault();
        setIsDone(false)
        const files = document.querySelector('[type=file]').files;
        const newFile = new FormData();

        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            newFile.append('file', file)
        }

        //Send File to server
        setIsLoading(true)
        axios.post(`${url}/upload-bill`, newFile, {
            timeout: 0
        }).then(result => {
            setHasError(false);
        }).catch(err => {
            console.log(err)
            setHasError(true);
        }).finally(() => {
            setIsLoading(false);
            setIsDone(true);
        })
    };

    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '50vw' }} className="card">
            <div className="card-body">
                <form onSubmit={uploadImage}>
                    {isLoading ? <p>
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        {message}
                    </p>
                        : <div>
                            <p>
                                <input type="file" name="file" />
                            </p>
                            <p>
                                <button className="btn btn-primary" type="submit">Upload</button>
                            </p>
                        </div>}
                    {isDone && !hasError ? <div className="alert alert-success" role="alert">
                        Your file has been extracted!&nbsp;
              <a href={url + "/get-file/results/result.txt"}>Click here to download your file</a>
                    </div> : <div></div>}
                    {isDone && hasError ? <div className="alert alert-danger" role="alert">
                        There was a problem processing your file. Please retry.
            </div> : <div></div>}
                </form>
            </div>
        </div>
    </div>
}
