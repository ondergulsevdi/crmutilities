// JavaScript Crm Helper source code

function getContext() {

    if (typeof GetGlobalContext !== "undefined") {
        /*ignore jslint start*/
        return GetGlobalContext();
        /*ignore jslint end*/

    }
    else {

        if (typeof Xrm !== "undefined") {
            return Xrm.Page.context;
        }
        else {

            throw new Error("Context is not available.");
        }
    }
}

function getCrmServerUrl() {
    var context = getContext();
    var serverUrl = window.location.protocol + "//" + window.location.host + "/" + context.getOrgUniqueName();
    if (serverUrl.match(/\/$/)) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }
    return serverUrl;
}

function getAllBusinessRequiredFields() {

    var attributes = Xrm.Page.data.entity.attributes.get();
    var requiredAttributes = [];
    attributes.forEach(function (attribute) {
        if (attribute.getRequiredLevel() == "required") {
            requiredAttributes.push(attribute);
        }
    });

    return requiredAttributes;

}

function isPageReadyToSave() {

    var isReady = true;

    getAllBusinessRequiredFields().forEach(function (attribute) {
        isReady = isReady & attribute.getValue() != null;
    });

    return isReady;
}

function setFieldToBusinessRequiredStatus(fieldname, requiredStatus) {
    var field = Xrm.Page.getAttribute(fieldname);
    if (field != null) {
        field.setRequiredLevel(requiredStatus);
    }
}

function setNameField(crmNameFieldToSet, crmFieldsToConcatenate) {
    var params = [].slice.call(arguments);

    var fieldToSet = Xrm.Page.getAttribute(crmNameFieldToSet);

    if (fieldToSet == null) {
        throw new Error('setNameField jscript function failed. The field to set does not exist on the form.');
    }

    if (params.length > 1) {
        var name = '';

        for (var item = 1; item < params.length; item++) {
            var field = Xrm.Page.getAttribute(params[item]);

            if (field != null) {
                var fieldType = field.getAttributeType().toLowerCase();
                var fieldValue = null;
                if (fieldType == 'lookup') {
                    var fieldValueArr = field.getValue();
                    if (fieldValueArr != null && fieldValueArr.length > 0) {
                        fieldValue = fieldValueArr[0].name;
                    }
                }
                else if (fieldType == 'optionset') {
                    fieldValue = field.getText();
                }
                else {
                    fieldValue = field.getValue();
                }

                if (fieldValue != null) {
                    name = name.concat(fieldValue, ' - ');
                }
            }
            else {
                ////If the parameter is a text string, this will be appended to the string
                name = name.concat(params[item], ' - ');
            }
        }

        name = name.substring(0, name.length - 3);

        if (fieldToSet != null) {
            fieldToSet.setValue(name);
        }
    }
    else {
        throw new Error('setNameField jscript function failed. The field to set name information is not specified.');
    }
}

function retrieveRecord(odataSetName, url) {
    if (!odataSetName) {
        alert("odataSetName is required.");
        return;
    }

   // var serverUrl = "http://" + location.href.split("/")[2];
    var serverUrl = location.protocol + "//" + location.href.split("/")[2];
    var ODataPath = serverUrl + "/" + Xrm.Page.context.getOrgUniqueName() + "/XRMServices/2011/OrganizationData.svc/";
    var fullUrl = ODataPath + odataSetName + url;

    var result = null;
    jQuery.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        async: false,
        cache: false,
        url: fullUrl,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            result = data.d;
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            result = "hata";
        }
    });

    return result;
}

function setFieldDisabled(Field, Disabled) {
    var SetField = Xrm.Page.ui.controls.get(Field);
    if (SetField != null) {
        SetField.setDisabled(Disabled);
    }
}

function doesControlHaveAttribute(control) {
    var controlType = control.getControlType();
    return controlType != "iframe" && controlType != "webresource" && controlType != "subgrid";
}

function disableFormFields(onOff) {
    Xrm.Page.ui.controls.forEach(function (control, index) {
        if (doesControlHaveAttribute(control)) {
            control.setDisabled(onOff);
        }
    });
}

function setNavigationItemVisible(navItem, isVisible) {
    var navitem = Xrm.Page.ui.navigation.items.get(navItem);
    if (navitem !== null) {
        navitem.setVisible(isVisible);
    }
}

function setSectionVisible(Tab, Section, Visible) {
    if (Xrm.Page.ui.tabs.get(Tab) != null) {
        if (Xrm.Page.ui.tabs.get(Tab).sections.get(Section) != null) {
            Xrm.Page.ui.tabs.get(Tab).sections.get(Section).setVisible(Visible);
        }
    }
}

function setFieldVisible(Field, Disabled) {
    var SetField = Xrm.Page.ui.controls.get(Field);
    if (SetField != null) {
        SetField.setVisible(Disabled);
    }
}

function setSectionAttributesDisable(Tab, Section, Disable) {
    if (Xrm.Page.ui.tabs.get(Tab) != null) {
        if (Xrm.Page.ui.tabs.get(Tab).sections.get(Section) != null) {
            var controls = Xrm.Page.ui.tabs.get(Tab).sections.get(Section).controls.get();
            for (var k = 0; k < controls.length; k++) {
                var control = controls[k];
                control.setDisabled(Disable);
            }
        }
    }
}

function SetLookupValue(fieldName, id, name, entityType) {
    try {
        if (fieldName != null) {
            var lookupValue = new Array();
            lookupValue[0] = new Object();
            lookupValue[0].id = id;
            lookupValue[0].name = name;
            lookupValue[0].entityType = entityType;
            Xrm.Page.getAttribute(fieldName).setValue(lookupValue);
        }
    }
    catch (err) {
        alert(err);
    }
}

function setFieldValueToNull(attributeName) {
    if (Xrm.Page.data.entity.attributes.get(attributeName) != null) {
        Xrm.Page.data.entity.attributes.get(attributeName).setValue(null);
    }
}

function setFieldValue(attributeName, value) {
    if (Xrm.Page.data.entity.attributes.get(attributeName) != null) {
        Xrm.Page.data.entity.attributes.get(attributeName).setValue(value);
    }
}

function getCRMConfigurationValue(key) {
    var result;
    var columns = ['etel_value'];
    var filter = " etel_name eq '" + key + "'";

    CrmRestKit.ByQuery('etel_crmconfiguration', columns, filter, false).fail(function (xhr, status, ethrow) {
        alert('Error: ' + status + ': ' + key + ' could not found in CRM configuration table.');
    }).done(function (collection) {
        if (collection.d != null && collection.d.results != null && collection.d.results.length > 0) {
            result = collection.d.results[0].etel_value;
        }
    });

    return result;
}

function getOrg() {
    ///<summary>
    /// get organisation
    ///</summary>
    var Org = "";
    if (typeof GetGlobalContext == "function") {
        var context = GetGlobalContext();
        Org = context.getOrgUniqueName();
    }
    else {
        if (typeof Xrm.Page.context == "object") {
            Org = Xrm.Page.context.getOrgUniqueName();
        }
        else {
            throw new Error("Unable to access Organisation name");
        }
    }

    return Org;
}

function getUser() {
    ///<summary>
    /// get logged in user
    ///</summary>
    var User = "";
    if (typeof GetGlobalContext == "function") {
        var context = GetGlobalContext();
        User = context.getUserId();
    }
    else {
        if (typeof Xrm.Page.context == "object") {
            User = Xrm.Page.context.getUserId();
        }
        else {
            throw new Error("Unable to access the UserId");
        }
    }

    return User;
}

function openDialogWindow(dialogId, entityLogicalName, objectId) {
    var url = "/" + getOrg() + "/cs/dialog/rundialog.aspx?DialogId=" + dialogId + "&EntityName=" + entityLogicalName + "&ObjectId=" + objectId;
    window.open(url, "", "status=no,scrollbars=no,toolbars=no,menubar=no,location=no");
}

function Hexa4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function GenerateGuid() {
    return (Hexa4() + Hexa4() + "-" + Hexa4() + "-" + Hexa4() + "-" + Hexa4() + "-" + Hexa4() + Hexa4() + Hexa4()).toUpperCase();
}

function stopAutoSave(context) {
    var saveEvent = context.getEventArgs();
    if (saveEvent.getSaveMode() == 70) { //Form AutoSave Event
        saveEvent.preventDefault(); //Stops the Save Event
    }
}

function GetObjectTypeCodeByName(entityName) {
    try {
        var lookupService = new RemoteCommand('LookupService', 'RetrieveTypeCode');
        lookupService.SetParameter('entityName', entityName);
        var result = lookupService.Execute();
        if (result.Success && typeof result.ReturnValue == 'number') {
            return result.ReturnValue;
        }
        else {
            return null;
        }
    }
    catch (e) {
        alert('Error while getting ETC by Name – ' + e.description);
    }
}

function GetFormType() {
    return Xrm.Page.ui.getFormType();
}

function HideRibbonButton(hideButtons) {


    var buttonID = hideButtons.split("&");
    for (var i = 0; i < buttonID.length; i++) {
        RibbonElementsVisiblityById(buttonID[i], 'none');
    }
}

function RibbonElementsVisiblityById(buttonId, visibility) {
    var btn = window.top.document.getElementById(buttonId);
    if (btn != null) btn.style.display = visibility;
}

function DateReviver(key, value) {
    var a;
    if (typeof value === 'string') {
        a = /Date\(([-+]?\d+)\)/.exec(value);
        if (a) {
            return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
        }
    }
    return value;
}

function xmlEncode(strInput) {
    var c;
    var XmlEncode = '';

    if (strInput == null) {
        return null;
    }
    if (strInput == '') {
        return '';
    }

    var performanceVariable = strInput.length;
    for (var cnt = 0; cnt < performanceVariable; cnt++) {
        c = strInput.charCodeAt(cnt);

        if (((c > 96) && (c < 123)) || ((c > 64) && (c < 91)) || (c == 32) || ((c > 47) && (c < 58)) || (c == 46) || (c == 44) || (c == 45) || (c == 95)) {
            XmlEncode = XmlEncode + String.fromCharCode(c);
        }
        else {
            XmlEncode = XmlEncode + '&#' + c + ';';
        }
    }

    return XmlEncode;
}

function parameterCheck(parameter, type, errorMessage) {
    switch (type) {
        case "String":
            if (typeof parameter !== "string") {
                throw new Error(errorMessage);
            }
            break;
        case "Number":
            if (typeof parameter !== "number") {
                throw new Error(errorMessage);
            }
            break;
        case "Function":
            if (typeof parameter !== "function") {
                throw new Error(errorMessage);
            }
            break;
        case "EntityFilters":
            var found = false;
            for (var x in this.EntityFilters) {
                if (this.EntityFilters[x] == parameter) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(errorMessage);
            }
            break;
        case "Boolean":
            if (typeof parameter !== "boolean") {
                throw new Error(errorMessage);
            }
            break;
        case "GUID":
            var re = new RegExp("[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}");
            if (!(typeof parameter === "string" && re.test(parameter))) {
                throw new Error(errorMessage);
            }

            break;
        default:
            throw new Error("An invalid type parameter value was passed to the parameterCheck function.");
            break;
    }
}

function getError(faultXml) {
    ///<summary>
    /// Parses the WCF fault returned in the event of an error.
    ///</summary>
    ///<param name="faultXml" Type="XML">
    /// The responseXML property of the XMLHttpRequest response.
    ///</param>
    var errorMessage = "Unknown Error (Unable to parse the fault)";
    if (typeof faultXml === "object") {
        try {
            var bodyNode = faultXml.firstChild.firstChild;
            //Retrieve the fault node
            var bodyNodeLength = bodyNode.childNodes.length;
            for (var i = 0; i < bodyNodeLength; i++) {
                var node = bodyNode.childNodes[i];
                var nodeLength = node.childNodes.length;
                //NOTE: This comparison does not handle the case where the XML namespace changes
                if ("s:Fault" === node.nodeName) {
                    for (var j = 0; j < nodeLength; j++) {
                        var faultStringNode = node.childNodes[j];
                        if ("faultstring" === faultStringNode.nodeName) {
                            errorMessage = faultStringNode.textContent === undefined ? faultStringNode.text : faultStringNode.textContent;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        catch (e) { };
    }
    return new Error(errorMessage);
}

function setStateCodeStatusCodeResponse(req, successCallback, errorCallback) {
    ///<summary>
    /// Recieves the assign response
    ///</summary>
    ///<param name="req" Type="XMLHttpRequest">
    /// The XMLHttpRequest response
    ///</param>
    ///<param name="successCallback" Type="Function">
    /// The function to perform when an successfult response is returned.
    /// For this message no data is returned so a success callback is not really necessary.
    ///</param>
    ///<param name="errorCallback" Type="Function">
    /// The function to perform when an error is returned.
    /// This function accepts a JScript error returned by the _getError function
    ///</param>
    if (req.readyState == 4) {
        if (req.status == 200) {
            if (successCallback != null) {
                successCallback();
            }
        }
        else {
            errorCallback(getError(req.responseXML));
        }
    }
}

function setStateCodeStatusCode(recordId, objectTypeName, stateCode, statusCode, successCallback, errorCallback) {
    ///<param name="successCallback" Type="Function">
    /// The function to perform when an successfult response is returned.
    ///</param>
    if (successCallback != null) this.parameterCheck(successCallback, "Function", "successCallback parameter must be a function.");

    ///<param name="errorCallback" Type="Function">
    /// The function to perform when an error is returned.
    ///</param>
    if (errorCallback != null) this.parameterCheck(errorCallback, "Function", "errorCallback parameter must be a function.");

    if (recordId != null) this.parameterCheck(recordId, "GUID", "recordId must be a string Representing a GUID value.");

    if (stateCode != null) this.parameterCheck(stateCode, "Number", "stateCode must be a string Representing a valid CRM State Code .");

    if (statusCode != null) this.parameterCheck(statusCode, "Number", "statusCode must be a string Representing a valid CRM Status Code .");

    var requestMain = ""
    requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
    requestMain += "  <s:Body>";
    requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
    requestMain += "      <request i:type=\"b:SetStateRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">";
    requestMain += "        <a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
    requestMain += "          <a:KeyValuePairOfstringanyType>";
    requestMain += "            <c:key>EntityMoniker</c:key>";
    requestMain += "            <c:value i:type=\"a:EntityReference\">";
    requestMain += "              <a:Id>" + this.xmlEncode(recordId) + "</a:Id>";
    requestMain += "              <a:LogicalName>" + this.xmlEncode(objectTypeName) + "</a:LogicalName>";
    requestMain += "              <a:Name i:nil=\"true\" />";
    requestMain += "            </c:value>";
    requestMain += "          </a:KeyValuePairOfstringanyType>";
    requestMain += "          <a:KeyValuePairOfstringanyType>";
    requestMain += "            <c:key>State</c:key>";
    requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
    requestMain += "              <a:Value>" + stateCode + "</a:Value>";
    requestMain += "            </c:value>";
    requestMain += "          </a:KeyValuePairOfstringanyType>";
    requestMain += "          <a:KeyValuePairOfstringanyType>";
    requestMain += "            <c:key>Status</c:key>";
    requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
    requestMain += "              <a:Value>" + statusCode + "</a:Value>";
    requestMain += "            </c:value>";
    requestMain += "          </a:KeyValuePairOfstringanyType>";
    requestMain += "        </a:Parameters>";
    requestMain += "        <a:RequestId i:nil=\"true\" />";
    requestMain += "        <a:RequestName>SetState</a:RequestName>";
    requestMain += "      </request>";
    requestMain += "    </Execute>";
    requestMain += "  </s:Body>";
    requestMain += "</s:Envelope>";

    var req = new XMLHttpRequest();
    req.open("POST", getCrmServerUrl() + "/XRMServices/2011/Organization.svc/web", true)
    // Responses will return XML. It isn't possible to return JSON.
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    req.onreadystatechange = function () {
        setStateCodeStatusCodeResponse(req, successCallback, errorCallback);
    };
    req.send(requestMain);

}

    var customerExternalId;
    var subscriptionCustomer = new Object();
    subscriptionCustomer.LogicalName = "";
    subscriptionCustomer.Id = "";
    var individualCustomer = Xrm.Page.getAttribute(contactIdFieldName).getValue();
    var corporateCustomer = Xrm.Page.getAttribute(accountIdFieldName).getValue();
    if (individualCustomer != null) {
        subscriptionCustomer.EntityParam = "ContactId";
        subscriptionCustomer.LogicalName = "Contact";
        subscriptionCustomer.Id = individualCustomer[0].id;
    } else if (corporateCustomer != null) {
        subscriptionCustomer.EntityParam = "AccountId";
        subscriptionCustomer.LogicalName = "Account";
        subscriptionCustomer.Id = corporateCustomer[0].id;
    } else {
        return null; // Neither of the parameters is valid :(
    }

    var columns = ['etel_externalid'];
    var filter = subscriptionCustomer.EntityParam + " eq guid'" + subscriptionCustomer.Id + "'";

    CrmRestKit.ByQuery(subscriptionCustomer.LogicalName, columns, filter, false).fail(function (xhr, status, ethrow) {
        window.console.log("Error <getExternalIdByGuid()>: " + xhr.status);
    }).done(function (collection) {
        if (collection.d !== null && collection.d.results !== null && collection.d.results.length > 0) {
            customerExternalId = collection.d.results[0].etel_externalid;
        }
    });

    return customerExternalId;
};
function GetUserLanguageCode() {
    if (typeof Xrm === "undefined") {
        return window.parent.Xrm.Page.context.getUserLcid();
    }
    else {
        return Xrm.Page.context.getUserLcid();
    }
}

function preventAutoSave(econtext) {
    var eventArgs = econtext.getEventArgs();
    if (eventArgs.getSaveMode() == 70) {
        eventArgs.preventDefault();
    }
}

function setFormToReadOnly() {
    //Set the whole form read-only
    Xrm.Page.ui.controls.forEach(function (control, index) {
        if (control.getControlType() == "standard") {
            if (control._control && control._control.get_innerControl() && control._control.get_innerControl()._element && control._control.get_innerControl()._element.tagName && control._control.get_innerControl()._element.tagName.toLowerCase() === "textarea") {
                //There's a bug on the setDisabled on IE9 by which when the textarea is disabled using setDisabled, the scroll bar doesn't works, and you can't copy the text either.
                //So, in this case, we are setting the textarea editable with the submit mode = none
                control.getAttribute().setSubmitMode("never");
            }
            else {
                control.setDisabled(true); //disable any other controls normally
            }
        }
        else control.setDisabled(true); //disable any other controls normally
    });
}

function setFormToReadOnly() {
    //Set the whole form read-only
    Xrm.Page.ui.controls.forEach(function (control, index) {
        try {
            if (control.getControlType() == "standard") {
                if (control._control && control._control.get_innerControl() && control._control.get_innerControl()._element && control._control.get_innerControl()._element.tagName && control._control.get_innerControl()._element.tagName.toLowerCase() === "textarea") {
                    //There's a bug on the setDisabled on IE9 by which when the textarea is disabled using setDisabled, the scroll bar doesn't works, and you can't copy the text either.
                    //So, in this case, we are setting the textarea editable with the submit mode = none
                    control.getAttribute().setSubmitMode("never");
                }
                else {
                    control.setDisabled(true); //disable any other controls normally
                }
            }
            else control.setDisabled(true); //disable any other controls normally
        }
        catch (e) { }
    });

}

function setSubmitMode(fieldName, submitMode) {
    var field = Xrm.Page.getAttribute(fieldName);
    if (field != null) {
        field.setSubmitMode(submitMode);
    }
}

function IsSubmitButtonEnabled() {
    var state = Xrm.Page.getAttribute("statecode").getValue();

    if (state == 0)
        return true;
    else
        return false;
}

function TypeFormValidator() {
    var FORM_TYPE_CREATE = 1;
    var formType = Xrm.Page.ui.getFormType();
    if (formType == FORM_TYPE_CREATE) {
        return true;
    }
    else {
        var state = Xrm.Page.getAttribute("statecode").getValue();

        if (state == 0)
            return true;
        else
            return false;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getId() {
    return Xrm.Page.data.entity.getId();
}



