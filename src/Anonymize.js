import React, { useEffect, useRef, useState } from "react";
import axios from 'axios'
import { url } from "./url";

export default function Anonymize() {
    const [file, setFile] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        // SOCKET
        const socket = window.io(url);
        socket.on('connect', function () {
            console.log("Connected to server")
        });

        socket.on('state', function (data) {
            console.log(data)
            setMessage(data.message)
        });


        if (file) {
            var startX, startY, mouseX, mouseY, newRect;
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            var imageObj = new Image();
            var isRecDown = false;
            var rects = [];

            imageObj.src = file;
            imageObj.onload = function () {
                context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
            };

            function handleMouseDown(e) {
                e.preventDefault();
                e.stopPropagation();
                startX = e.clientX - this.offsetLeft;
                startY = e.clientY - this.offsetTop;
                isRecDown = true;
            }

            function handleMouseUp(e) {
                e.preventDefault();
                e.stopPropagation();
                mouseX = e.clientX - this.offsetLeft;
                mouseY = e.clientY - this.offsetTop;
                isRecDown = false;
                rects.push(newRect);
                drawAllRect();
            }

            function drawAllRect() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
                context.lineWidth = 1;
                rects.forEach((rect) => {
                    context.strokeStyle = rect.color;
                    context.globalAlpha = 1;
                    context.strokeRect(
                        rect.left,
                        rect.top,
                        rect.right - rect.left,
                        rect.bottom - rect.top
                    );
                    context.beginPath();
                    context.closePath();
                    context.fillStyle = rect.color;
                    context.fill();
                });
            }

            function handleMouseOut(e) {
                e.preventDefault();
                e.stopPropagation();
                mouseX = e.clientX - this.offsetLeft;
                mouseY = e.clientY - this.offsetTop;
                isRecDown = false;
            }

            function handleMouseMove(e) {
                if (isRecDown) {
                    e.preventDefault();
                    e.stopPropagation();
                    mouseX = e.clientX - this.offsetLeft;
                    mouseY = e.clientY - this.offsetTop;
                    newRect = {
                        left: Math.min(startX, mouseX),
                        right: Math.max(startX, mouseX),
                        top: Math.min(startY, mouseY),
                        bottom: Math.max(startY, mouseY),
                        color: "red",
                    };
                    drawAllRect();
                    context.strokeStyle = "red";
                    context.lineWidth = 1;
                    context.globalAlpha = 1;
                    context.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
                }
            }

            canvas.addEventListener("mousemove", handleMouseMove, false);
            canvas.addEventListener("mousedown", handleMouseDown, false);
            canvas.addEventListener("mouseup", handleMouseUp, false);
            canvas.addEventListener("mouseout", handleMouseOut, false);
        }
    }, [file]);

    const handleChange = function (e) {
        var files = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            setFile(this.result);
        };
        reader.readAsDataURL(files);
    };

    const uploadImage = (e) => {
        e.preventDefault();
        setIsDone(false)
        const files = document.querySelector('[type=file]').files;
        const newFile = new FormData();
        newFile.append('name', document.getElementById('name').value);
        newFile.append('email', document.getElementById('email').value);

        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            newFile.append('file', file)
        }

        //Send File to server
        setIsLoading(true)
        axios.post(`${url}/upload-files`, newFile, {
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
                            Your file has been anonymized!&nbsp;
              <a href={url + "/get-file/results/output.pdf"}>Click here to download your file</a>
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
        </div>
    );
}
