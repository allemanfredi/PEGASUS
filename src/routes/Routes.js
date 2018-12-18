import React from "react";
import { Route , Switch } from "react-router-dom";

import Init from "../containers/init/Init"
import Home  from "../containers/home/Home";
import Login from "../containers/login/Login"
import Send from "../containers/send/Send"
import Receive from "../containers/receive/Receive";
import Interact from "../containers/interact/Interact"
import Add from "../containers/add/Add"



export default ({ childProps }) =>
  <Switch>
    
    <Route exact path="/home"   component={Home}       props={childProps}/>
    <Route path="/send"         component={Send}       props={childProps}/>
    <Route path="/receive"      component={Receive}    props={childProps}/>
    <Route path="/login"        component={Login}      props={childProps}/>
    <Route path="/interact"     component={Interact}   props={childProps}/>
    <Route path="/init"         component={Init}       props={childProps}/>
    <Route path="/add"          component={Add}        props={childProps}/>

  </Switch>;