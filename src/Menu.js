import React from "react";
import { Link } from 'react-router-dom'

export default function Menu() {
    return <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ width: "50vw" }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: "row", justifyContent: 'space-evenly' }}>
                <div>
                    <Link to={'anonymize'}>
                        <button type="button" className="btn btn-block btn-primary">Anonymization</button>
                    </Link>
                </div>
                <div>
                    <Link to={'bill'}>
                        <button type="button" className="btn btn-block btn-primary">Extraction de données</button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
}
