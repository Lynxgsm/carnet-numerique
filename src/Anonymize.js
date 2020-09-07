import React, { useEffect, useRef, useState } from "react";
import axios from 'axios'
import { url } from "./url";
import { Modal, Button, ProgressBar } from "react-bootstrap";

export default function Anonymize() {
    const [file, setFile] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const canvasRef = useRef(null);
    // MODAL FUNCTIONS
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [progression, setprogression] = useState(0)
    // SOCKET
    const socket = window.io(url);

    useEffect(() => {
        socket.on('connect', function () {
            console.log("Connected to server")
        });

        socket.on('disconnect', function (data) {
            console.log(data)
            console.log("Disconnected to server")
        });

        socket.on('result', function () {
            handleShow()
        });

        socket.on('progression-state', function (data) {
            setprogression(data.message)
        });

        socket.on('state', function (data) {
            setMessage(data.message)
        });

    }, []);

    const uploadImage = async (e) => {
        e.preventDefault();
        setIsDone(false)
        const files = document.querySelector('[type=file]').files;
        const newFile = new FormData();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            newFile.append('file', file)
        }

        //Send File to server
        setIsLoading(true)
        await axios.post(`${url}/upload-files`, newFile, {
            timeout: 0,
        }).then(result => {
            setHasError(false);
        }).catch(err => {
            console.log(err)
            setHasError(true);
        }).finally(() => {
            console.log("Tapitra")
            setIsLoading(false);
            setIsDone(true);
        })

        socket.on('setinfo', (data) => {
            console.log("HANDEFA KOA ZAHO")
            socket.emit('begin-anonymization', { name, email, data });
        })


    };

    const dataURItoBlob = (dataURI) => {
        var byteString;
        var uri = dataURI.split(",");
        if (uri[0].includes("base64")) {
            byteString = atob(uri[1]);
        } else {
            byteString = unescape(uri[1]);
        }
        var mimeType = uri[0].split(":")[1].split(";")[0];
        var uint = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            uint[i] = byteString.charCodeAt(i);
        }
        return new Blob([uint], { type: mimeType });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ width: '50vw' }} className="card">
                <div className="card-body">
                    <form onSubmit={uploadImage}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" className="form-control" id="name" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="clientname">Customer name</label>
                            <input type="text" className="form-control" id="email" />
                        </div>
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
                            Anonymization: &nbsp;
                            <ProgressBar now={progression} />
                        </div> : <div></div>}
                        {isDone && hasError ? <div className="alert alert-danger" role="alert">
                            There was a problem processing your file. Please retry.
            </div> : <div></div>}
                        <div className="alert alert-info" role="alert">
                            Phones and addresses will be automatically removed.
            </div>
                    </form>
                </div>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Your file has been anonymized</Modal.Title>
                </Modal.Header>
                <Modal.Body>You can click on the button below to download your anonymized file</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
          </Button>
                    <a className="btn btn-primary" href={url + "/get-file/results/output.pdf"}>Download your file</a>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

