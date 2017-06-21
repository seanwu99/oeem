/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/Device"],function(C,J,D){"use strict";return C.extend("sap.ui.demokit.icex.view.Favorite",{onInit:function(){this._initUiModel();this.getView().addEventDelegate({onBeforeShow:function(e){this.updatePageTitle();}.bind(this)});},_initUiModel:function(){var m=new J({inEdit:false,inDisplay:true,listMode:(D.system.phone)?"None":"SingleSelectMaster",listItemType:(D.system.phone)?"Active":"Inactive",showToolbar:(D.system.phone)?false:true});this.getView().setModel(m,"ui");},toggleUiModel:function(){var m=this.getView().getModel("ui");var d=m.getData();var _;var a;var b=true;if(d.inDisplay){_="Delete";a="Inactive";}else{_=(D.system.phone)?"None":"SingleSelectMaster";a=(D.system.phone)?"Active":"Inactive";b=(D.system.phone)?false:true;}m.setData({inEdit:d.inDisplay,inDisplay:d.inEdit,listMode:_,listItemType:a,showToolbar:b});},updatePageTitle:function(){var f=this.getView().getModel("fav"),c=f.getData().count,b=this.getView().getModel("i18n").getResourceBundle(),t=b.getText("favoritesPageTitle",[c]);this.getView().byId("page").setTitle(t);},navBack:function(e){this.getOwnerComponent().getEventBus().publish("nav","back");},deleteIconList:function(e){var n=e.getParameter("listItem").getTitle();this.getView().getModel("fav").toggleFavorite(n);this.updatePageTitle();},selectIconList:function(e){this._showDetail(e.getParameter("listItem"));},pressIconListItem:function(e){this._showDetail(e.getSource());},_showDetail:function(i){var b=this.getOwnerComponent().getEventBus();b.publish("nav","to",{id:"Detail"});b.publish("app","RefreshDetail",{name:i.getBindingContext("fav").getObject().name});}});});
