import React, { useEffect, useRef, useState } from "react";
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom'
import Anonymize from "./Anonymize";
import Menu from "./Menu";
import Bill from "./Bill";

export default function App() {
  return <Router>
    <Switch>
      <Route path="/" exact component={Menu}></Route>
      <Route path="/anonymize" exact component={Anonymize}></Route>
      <Route path="/bill" exact component={Bill}></Route>
    </Switch>
  </Router>
}
