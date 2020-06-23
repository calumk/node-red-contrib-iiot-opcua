"use strict";require("source-map-support").install();var de=de||{biancoroyal:{opcua:{iiot:{core:{connector:{}}}}}};de.biancoroyal.opcua.iiot.core.connector.core=de.biancoroyal.opcua.iiot.core.connector.core||require("./opcua-iiot-core"),de.biancoroyal.opcua.iiot.core.connector.internalDebugLog=de.biancoroyal.opcua.iiot.core.connector.internalDebugLog||require("debug")("opcuaIIoT:connector"),de.biancoroyal.opcua.iiot.core.connector.detailDebugLog=de.biancoroyal.opcua.iiot.core.connector.detailDebugLog||require("debug")("opcuaIIoT:connector:details"),de.biancoroyal.opcua.iiot.core.connector.libDebugLog=de.biancoroyal.opcua.iiot.core.connector.libDebugLog||require("debug")("opcuaIIoT:connector:nodeopcua"),de.biancoroyal.opcua.iiot.core.connector.Stately=de.biancoroyal.opcua.iiot.core.connector.Stately||require("stately.js"),de.biancoroyal.opcua.iiot.core.connector.initConnectorNode=function(o){return this.core.initClientNode(o),o.bianco.iiot.sessionNodeRequests=0,o.bianco.iiot.endpoints=[],o.bianco.iiot.userIdentity=null,o.bianco.iiot.opcuaClient=null,o.bianco.iiot.opcuaSession=null,o.bianco.iiot.discoveryServer=null,o.bianco.iiot.serverCertificate=null,o.bianco.iiot.discoveryServerEndpointUrl=null,o.bianco.iiot.createConnectionTimeout=null,o.bianco.iiot.hasOpcUaSubscriptions=!1,o},de.biancoroyal.opcua.iiot.core.connector.createStatelyMachine=function(){return de.biancoroyal.opcua.iiot.core.connector.Stately.machine({IDLE:{initopcua:"INITOPCUA",lock:"LOCKED",end:"END"},INITOPCUA:{open:"OPEN",close:"CLOSED",lock:"LOCKED",end:"END"},OPEN:{sessionrequest:"SESSIONREQUESTED",close:"CLOSED",lock:"LOCKED",end:"END"},SESSIONREQUESTED:{open:"OPEN",sessionactive:"SESSIONACTIVE",lock:"LOCKED",end:"END"},SESSIONACTIVE:{open:"OPEN",sessionclose:"SESSIONCLOSED",lock:"LOCKED",end:"END"},SESSIONRESTART:{idle:"IDLE",open:"OPEN",sessionclose:"SESSIONCLOSED",close:"CLOSED",lock:"LOCKED",end:"END"},SESSIONCLOSED:{idle:"IDLE",open:"OPEN",close:"CLOSED",sessionrestart:"SESSIONRESTART",lock:"LOCKED",unlock:"UNLOCKED",end:"END"},CLOSED:{open:"OPEN",lock:"LOCKED",unlock:"UNLOCKED",end:"END",idle:"IDLE"},LOCKED:{sessionclose:"SESSIONCLOSED",open:"OPEN",close:"CLOSED",unlock:"UNLOCKED",lock:"LOCKED",sessionrestart:"SESSIONRESTART",reconfigure:"RECONFIGURED",stopopcua:"STOPPED",renew:"RENEW",end:"END"},UNLOCKED:{idle:"IDLE",lock:"LOCKED",open:"OPEN",end:"END"},RECONFIGURED:{},RENEW:{},STOPPED:{},END:{}},"IDLE")},de.biancoroyal.opcua.iiot.core.connector.setListenerToClient=function(i){var n=this;if(this.core.assert(i.bianco.iiot),!i.bianco.iiot.opcuaClient)return n.internalDebugLog("Client Not Valid On Setting Events To Client"),void(i.showErrors&&i.error(new Error("Client Not Valid To Set Event Listeners"),{payload:"No Client To Set Event Listeners"}));i.bianco.iiot.opcuaClient.on("close",function(o){o&&n.internalDebugLog("Connection Error On Close "+o),i.bianco.iiot.isInactiveOnOPCUA()?n.detailDebugLog("Connector Not Active On OPC UA Close Event"):i.bianco.iiot.resetOPCUAConnection("Connector To Server Close"),n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!".bgWhite.red),n.internalDebugLog("CONNECTION CLOSED: "+i.endpoint),i.emit("server_connection_close")}),i.bianco.iiot.opcuaClient.on("backoff",function(o,e){n.internalDebugLog("!!! CONNECTION FAILED (backoff) FOR #".bgWhite.yellow,o," retrying ",e/1e3," sec. !!!"),n.internalDebugLog("CONNECTION FAILED: "+i.endpoint),i.bianco.iiot.stateMachine.lock()}),i.bianco.iiot.opcuaClient.on("abort",function(){n.internalDebugLog("!!! Abort backoff !!!"),n.internalDebugLog("CONNECTION BROKEN: "+i.endpoint),i.bianco.iiot.isInactiveOnOPCUA()?n.detailDebugLog("Connector Not Active On OPC UA Backoff Abort Event"):i.bianco.iiot.resetOPCUAConnection("Connector To Server Backoff Abort"),i.emit("server_connection_abort")}),i.bianco.iiot.opcuaClient.on("connection_lost",function(){n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION LOST !!!!!!!!!!!!!!!!!!!".bgWhite.orange),n.internalDebugLog("CONNECTION LOST: "+i.endpoint),i.bianco.iiot.stateMachine.lock(),i.emit("server_connection_lost")}),i.bianco.iiot.opcuaClient.on("connection_reestablished",function(){n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!".bgWhite.orange),n.internalDebugLog("CONNECTION RE-ESTABLISHED: "+i.endpoint),i.bianco.iiot.stateMachine.unlock()}),i.bianco.iiot.opcuaClient.on("start_reconnection",function(){n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!".bgWhite.yellow),n.internalDebugLog("CONNECTION STARTING RECONNECTION: "+i.endpoint),i.bianco.iiot.stateMachine.lock()}),i.bianco.iiot.opcuaClient.on("timed_out_request",function(){n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!".bgWhite.blue),n.internalDebugLog("CONNECTION TIMED OUT REQUEST: "+i.endpoint)}),i.bianco.iiot.opcuaClient.on("security_token_renewed",function(){n.detailDebugLog("!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!".bgWhite.violet),n.detailDebugLog("CONNECTION SECURITY TOKEN RENEWE: "+i.endpoint)}),i.bianco.iiot.opcuaClient.on("after_reconnection",function(){n.internalDebugLog("!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!".bgWhite.green),n.internalDebugLog("CONNECTION RECONNECTED: "+i.endpoint),i.emit("after_reconnection",i.bianco.iiot.opcuaClient),i.bianco.iiot.stateMachine.unlock()})},de.biancoroyal.opcua.iiot.core.connector.logSessionInformation=function(o){o.bianco.iiot.opcuaSession?(this.internalDebugLog("Session "+o.bianco.iiot.opcuaSession.name+" Id: "+o.bianco.iiot.opcuaSession.sessionId+" Started On "+o.endpoint),this.detailDebugLog("name :"+o.bianco.iiot.opcuaSession.name),this.detailDebugLog("sessionId :"+o.bianco.iiot.opcuaSession.sessionId),this.detailDebugLog("authenticationToken :"+o.bianco.iiot.opcuaSession.authenticationToken),this.internalDebugLog("timeout :"+o.bianco.iiot.opcuaSession.timeout),o.bianco.iiot.opcuaSession.serverNonce&&this.detailDebugLog((o.bianco.iiot.opcuaSession.serverNonce,o.bianco.iiot.opcuaSession.serverNonce.toString("hex"))),o.bianco.iiot.opcuaSession.serverCertificate?this.detailDebugLog((o.bianco.iiot.opcuaSession.serverCertificate,o.bianco.iiot.opcuaSession.serverCertificate.toString("base64"))):this.detailDebugLog("serverCertificate : None".red),this.detailDebugLog((o.bianco.iiot.opcuaSession.serverSignature,o.bianco.iiot.opcuaSession.serverSignature)),o.bianco.iiot.opcuaSession.lastRequestSentTime&&(this.detailDebugLog("lastRequestSentTime : "+o.bianco.iiot.opcuaSession.lastRequestSentTime),this.internalDebugLog((o.bianco.iiot.opcuaSession.lastRequestSentTime,new Date(o.bianco.iiot.opcuaSession.lastRequestSentTime).toISOString()))),o.bianco.iiot.opcuaSession.lastResponseReceivedTime&&(this.detailDebugLog("lastResponseReceivedTime : "+o.bianco.iiot.opcuaSession.lastResponseReceivedTime),this.internalDebugLog((o.bianco.iiot.opcuaSession.lastResponseReceivedTime,new Date(o.bianco.iiot.opcuaSession.lastResponseReceivedTime).toISOString())))):this.detailDebugLog("Session Not Valid To Log Information")},de.biancoroyal.opcua.iiot.core.connector.checkEndpoint=function(o){return!(!o.endpoint||!o.endpoint.includes("opc.tcp://"))||(this.internalDebugLog("Endpoint Not Valid -> "+o.endpoint),o.error(new Error("endpoint does not include opc.tcp://"),{payload:"Client Endpoint Error"}),!1)},module.exports=de.biancoroyal.opcua.iiot.core.connector;
//# sourceMappingURL=../maps/core/opcua-iiot-core-connector.js.map