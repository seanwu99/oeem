/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/model/ChangeReason','sap/ui/model/Filter','sap/ui/model/FilterType','sap/ui/model/ListBinding','sap/ui/model/Sorter','./ODataUtils','./CountMode'],function(q,C,F,a,L,S,O,b){"use strict";var c=L.extend("sap.ui.model.odata.ODataListBinding",{constructor:function(m,p,o,s,f,P){L.apply(this,arguments);this.sFilterParams=null;this.sSortParams=null;this.sRangeParams=null;this.sCustomParams=this.oModel.createCustomParams(this.mParameters);this.iStartIndex=0;this.bPendingChange=false;this.aKeys=[];this.bInitial=true;this.sCountMode=(P&&P.countMode)||this.oModel.sDefaultCountMode;this.bRefresh=false;this.bNeedsUpdate=false;this.bDataAvailable=false;this.bIgnoreSuspend=false;if(!this.oModel.getServiceMetadata()){var t=this,d=function(e){t.bInitial=false;t._initSortersFilters();t.oModel.detachMetadataLoaded(d);};this.oModel.attachMetadataLoaded(this,d);}else{this.bInitial=false;this._initSortersFilters();}var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(q.isArray(r)&&!s&&!f){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this.bDataAvailable=true;}else if(r===null&&this.oModel.resolve(this.sPath,this.oContext)){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this.bDataAvailable=true;}else{if(this.oModel.getServiceMetadata()){this.resetData();}}}});c.prototype.getContexts=function(s,l,t){if(this.bInitial){return[];}this.iLastLength=l;this.iLastStartIndex=s;this.iLastThreshold=t;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}if(!t){t=0;}var d=true,e=this._getContexts(s,l),o={},f;f=this.calculateSection(s,l,t,e);d=e.length!=l&&!(this.bLengthFinal&&e.length>=this.iLength-s);if(this.oModel.getServiceMetadata()){if(!this.bPendingRequest&&f.length>0&&(d||l<f.length)){this.loadData(f.startIndex,f.length);e.dataRequested=true;}}if(this.bRefresh){if(this.bLengthFinal&&this.iLength==0){this.loadData(f.startIndex,f.length,true);e.dataRequested=true;}this.bRefresh=false;}else{for(var i=0;i<e.length;i++){o[e[i].getPath()]=e[i].getObject();}if(this.bUseExtendedChangeDetection){if(this.aLastContexts&&s<this.iLastEndIndex){var g=this;var D=q.sap.arrayDiff(this.aLastContexts,e,function(h,n){return q.sap.equal(h&&g.oLastContextData&&g.oLastContextData[h.getPath()],n&&o&&o[n.getPath()]);},true);e.diff=D;}}this.iLastEndIndex=s+l;this.aLastContexts=e.slice(0);this.oLastContextData=q.sap.extend(true,{},o);}return e;};c.prototype.getCurrentContexts=function(){return this.aLastContexts||[];};c.prototype._getContexts=function(s,l){var d=[],o,k;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}for(var i=s;i<s+l;i++){k=this.aKeys[i];if(!k){break;}o=this.oModel.getContext('/'+k);d.push(o);}return d;};c.prototype.calculateSection=function(s,l,t,d){var e,f,p,P,r,o={},k;f=s;e=0;for(var i=s;i>=Math.max(s-t,0);i--){k=this.aKeys[i];if(!k){P=i+1;break;}}for(var j=s+l;j<s+l+t;j++){k=this.aKeys[j];if(!k){p=j;break;}}r=s-P;if(P&&s>t&&r<t){if(d.length!=l){f=s-t;}else{f=P-t;}e=t;}f=Math.max(f,0);if(f==s){f+=d.length;}if(d.length!=l){e+=l-d.length;}r=p-s-l;if(r==0){e+=t;}if(p&&r<t&&r>0){if(f>s){f=p;e+=t;}}if(this.bLengthFinal&&this.iLength<(e+f)){e=this.iLength-f;}o.startIndex=f;o.length=e;return o;};c.prototype.setContext=function(o){if(this.oContext!=o){this.oContext=o;if(this.isRelative()){this._initSortersFilters();if(!this.bInitial){var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(q.isArray(r)&&!this.aSorters.length>0&&!this.aFilters.length>0){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this._fireChange({reason:C.Context});}else if(!this.oModel.resolve(this.sPath,this.oContext)||r===null){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this._fireChange({reason:C.Context});}else{this.refresh();}}}}};c.prototype.getDownloadUrl=function(f){var p=[],P;if(f){p.push("$format="+encodeURIComponent(f));}if(this.sSortParams){p.push(this.sSortParams);}if(this.sFilterParams){p.push(this.sFilterParams);}if(this.sCustomParams){p.push(this.sCustomParams);}P=this.oModel.resolve(this.sPath,this.oContext);if(P){return this.oModel._createRequestUrl(P,null,p);}};c.prototype.loadData=function(s,l,p){var t=this,I=false;if(s||l){this.sRangeParams="$skip="+s+"&$top="+l;this.iStartIndex=s;}else{s=this.iStartIndex;}var P=[];if(this.sRangeParams){P.push(this.sRangeParams);}if(this.sSortParams){P.push(this.sSortParams);}if(this.sFilterParams){P.push(this.sFilterParams);}if(this.sCustomParams){P.push(this.sCustomParams);}if(!this.bLengthFinal&&(this.sCountMode==b.Inline||this.sCountMode==b.Both)){P.push("$inlinecount=allpages");I=true;}function f(D){q.each(D.results,function(i,h){t.aKeys[s+i]=t.oModel._getKey(h);});if(I&&D.__count){t.iLength=parseInt(D.__count,10);t.bLengthFinal=true;}if(t.iLength<s+D.results.length){t.iLength=s+D.results.length;t.bLengthFinal=false;}if(D.results.length<l||l===undefined){t.iLength=s+D.results.length;t.bLengthFinal=true;}if(s==0&&D.results.length==0){t.iLength=0;t.bLengthFinal=true;}t.oRequestHandle=null;t.bPendingRequest=false;t.bNeedsUpdate=true;t.bIgnoreSuspend=true;}function d(D){t.fireDataReceived({data:D});}function e(E,A){t.oRequestHandle=null;t.bPendingRequest=false;if(!A){t.aKeys=[];t.iLength=0;t.bLengthFinal=true;t.bDataAvailable=true;t._fireChange({reason:C.Change});}t.fireDataReceived();}function u(h){t.oRequestHandle=h;}var g=this.sPath,o=this.oContext;if(this.isRelative()){g=this.oModel.resolve(g,o);}if(g){if(p){var U=this.oModel._createRequestUrl(g,null,P);this.fireDataRequested();this.oModel.fireRequestSent({url:U,method:"GET",async:true});setTimeout(function(){t.bNeedsUpdate=true;t.checkUpdate();t.oModel.fireRequestCompleted({url:U,method:"GET",async:true,success:true});t.fireDataReceived({data:{}});},0);}else{this.bPendingRequest=true;this.fireDataRequested();this.oModel._loadData(g,P,f,e,false,u,d);}}};c.prototype.getLength=function(){if(this.bLengthFinal||this.iLength==0){return this.iLength;}else{var A=this.iLastThreshold||this.iLastLength||10;return this.iLength+A;}};c.prototype.isLengthFinal=function(){return this.bLengthFinal;};c.prototype._getLength=function(){var t=this;var p=[];if(this.sFilterParams){p.push(this.sFilterParams);}if(this.mParameters&&this.mParameters.custom){var o={custom:{}};q.each(this.mParameters.custom,function(s,v){o.custom[s]=v;});p.push(this.oModel.createCustomParams(o));}function _(D){t.iLength=parseInt(D,10);t.bLengthFinal=true;}function d(e){var E="Request for $count failed: "+e.message;if(e.response){E+=", "+e.response.statusCode+", "+e.response.statusText+", "+e.response.body;}q.sap.log.warning(E);}var P=this.oModel.resolve(this.sPath,this.oContext);if(P){var u=this.oModel._createRequestUrl(P+"/$count",null,p);var r=this.oModel._createRequest(u,"GET",false);r.headers["Accept"]="text/plain, */*;q=0.5";this.oModel._request(r,_,d,undefined,undefined,this.oModel.getServiceMetadata());}};c.prototype.refresh=function(f,m,e){var d=false;if(!f){if(e){var r=this.oModel.resolve(this.sPath,this.oContext);var E=this.oModel.oMetadata._getEntityTypeByPath(r);if(E&&(E.entityType in e)){d=true;}}if(m&&!d){q.each(this.aKeys,function(i,k){if(k in m){d=true;return false;}});}if(!m&&!e){d=true;}}if(f||d){this.abortPendingRequest();this.resetData();this._fireRefresh({reason:C.Refresh});}};c.prototype._fireRefresh=function(A){if(this.oModel.resolve(this.sPath,this.oContext)){this.bRefresh=true;this.fireEvent("refresh",A);}};c.prototype.initialize=function(){if(this.oModel.oMetadata.isLoaded()){if(this.bDataAvailable){this._fireChange({reason:C.Change});}else{this._fireRefresh({reason:C.Refresh});}}};c.prototype.checkUpdate=function(f,m){var d=this.sChangeReason?this.sChangeReason:C.Change,e=false,l,o,t=this,r,R;if(this.bSuspended&&!this.bIgnoreSuspend){return;}if(!f&&!this.bNeedsUpdate){r=this.oModel._getObject(this.sPath,this.oContext);R=q.isArray(r)&&!q.sap.equal(r,this.aExpandRefs);this.aExpandRefs=r;if(R){if(this.aSorters.length>0||this.aFilters.length>0){this.refresh();return;}else{this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;e=true;}}else if(m){q.each(this.aKeys,function(i,k){if(k in m){e=true;return false;}});}else{e=true;}if(e&&this.aLastContexts){e=false;var g=this._getContexts(this.iLastStartIndex,this.iLastLength,this.iLastThreshold);if(this.aLastContexts.length!=g.length){e=true;}else{q.each(this.aLastContexts,function(i,h){l=t.oLastContextData[h.getPath()];o=g[i].getObject();if(!q.sap.equal(l,o,true)){e=true;return false;}});}}}if(f||e||this.bNeedsUpdate){this.bNeedsUpdate=false;this._fireChange({reason:d});}this.sChangeReason=undefined;this.bIgnoreSuspend=false;};c.prototype.resetData=function(){this.aKeys=[];this.iLength=0;this.bLengthFinal=false;this.sChangeReason=undefined;this.bDataAvailable=false;if(this.oModel.isCountSupported()&&(this.sCountMode==b.Request||this.sCountMode==b.Both)){this._getLength();}};c.prototype.abortPendingRequest=function(){if(this.oRequestHandle){this.oRequestHandle.abort();this.oRequestHandle=null;this.bPendingRequest=false;}};c.prototype.sort=function(s,r){var d=false;if(!s){s=[];}if(s instanceof S){s=[s];}this.aSorters=s;this.createSortParams(s);if(!this.bInitial){this.aKeys=[];this.abortPendingRequest();this.sChangeReason=C.Sort;this._fireRefresh({reason:this.sChangeReason});this._fireSort({sorter:s});d=true;}if(r){return d;}else{return this;}};c.prototype.createSortParams=function(s){this.sSortParams=O.createSortParams(s);};c.prototype.filter=function(f,s,r){var d=false;if(!f){f=[];}if(f instanceof F){f=[f];}if(s==a.Application){this.aApplicationFilters=f;}else{this.aFilters=f;}if(!f||!q.isArray(f)||f.length==0){this.aFilters=[];}if(!this.aApplicationFilters||!q.isArray(this.aApplicationFilters)||this.aApplicationFilters.length===0){this.aApplicationFilters=[];}this.createFilterParams(this.aFilters,this.aApplicationFilters);if(!this.bInitial){this.resetData();this.abortPendingRequest();this.sChangeReason=C.Filter;this._fireRefresh({reason:this.sChangeReason});if(s==a.Application){this._fireFilter({filters:this.aApplicationFilters});}else{this._fireFilter({filters:this.aFilters});}d=true;}if(r){return d;}else{return this;}};c.prototype.createFilterParams=function(d,A){var f,s=O._createFilterParams(d,this.oModel.oMetadata,this.oEntityType),e=O._createFilterParams(A,this.oModel.oMetadata,this.oEntityType);if(s){f=s;}if(e){if(s){f="("+f+")"+"%20and%20"+"("+e+")";}else{f=e;}}if(f){this.sFilterParams="$filter="+f;}else{this.sFilterParams=undefined;}};c.prototype._initSortersFilters=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(!r){return;}this.oEntityType=this._getEntityType();this.createSortParams(this.aSorters);this.createFilterParams(this.aFilters.concat(this.aApplicationFilters));};c.prototype._getEntityType=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){var e=this.oModel.oMetadata._getEntityTypeByPath(r);return e;}return undefined;};c.prototype.resume=function(){this.bIgnoreSuspend=false;L.prototype.resume.apply(this,arguments);};return c;});
