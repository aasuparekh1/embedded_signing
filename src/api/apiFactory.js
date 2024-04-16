/* eslint-disable no-param-reassign */
import { getAuthToken } from "../services/accountRepository";

const configureInterceptors = (api) => {
  // Request interceptor for API calls
  api.interceptors.request.use(
    async (config) => {
      config.headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      const accessTokenInfo = getAuthToken();
      config.headers.Authorization = `Bearer ${accessTokenInfo.accessToken}`;
      console.log("config",config);
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // eslint-disable-next-line no-console
      console.error(`API call failed. Error:  ${error}`);
      return Promise.reject(error);
    }
  );
  return api;
};

const createAPI = (axios) => {
  const api = configureInterceptors(
    axios.create({
      withCredentials: false,
    })
  );
  return api;
};

export const createDocumentAPI = (
  axios,
  eSignBase,
  accountBaseUrl,
  accountId
) => {
  const api = createAPI(axios);

  const createTemplate = async (description, name, emailSubject) => {
    console.log("in createTemplate");
    const requestData = {
      description,
      name,
      emailSubject,
      shared: false,
      status: "created",
      recipients: {
        signers: [
          {
            recipientId: "1",
            roleName: "signer",
            routingOrder: "1",
          },
        ],
      },
    };
    debugger;
    console.log("requestData",requestData);
    const response = await api.post(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/templates`,
      requestData
    );
    console.log("response",response);
    return response.data.templateId;
  };

  const addDocumentToTemplate = async (templateId, documentBase64, name) => {
    const documentId = 1;
    const requestData = {
      documents: [
        {
          documentBase64,
          name,
          documentId,
          fileExtension: "docx",
          order: 1,
          pages: 1,
        },
      ],
    };
    const response = await api.put(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/templates/${templateId}/documents/${documentId}`,
      requestData
    );
    return response.data.documentIdGuid;
  };

  const addTabsToTemplate = async (templateId) => {
    const requestData = {
      signHereTabs: [
        {
          anchorString: "Employee Signature",
          anchorUnits: "pixels",
          anchorXOffset: 5,
          anchorYOffset: -22,
        },
      ],
      dateSignedTabs: [
        {
          anchorString: "Date",
          anchorUnits: "pixels",
          anchorYOffset: -22,
        },
      ],
    };
    const response = await api.post(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/templates/${templateId}/recipients/1/tabs`,
      requestData
    );
    return response.status;
  };

  const createEnvelop = async (templateId, signerEmail, signerName) => {
    const requestData = {
      templateId,
      templateRoles: [
        {
          email: signerEmail,
          name: signerName,
          roleName: "signer",
        },
      ],
      status: "created",
    };
    debugger;
    const response = await api.post(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes`,
      requestData
    );
    return response.data.envelopeId;
  };

  const getDocumentId = async (envelopeId) => {
    const response = await api.get(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes/${envelopeId}/docGenFormFields`
    );
    return response.data.docGenFormFields[0].documentId;
  };

  const updateFormFields = async (
    documentId,
    envelopId,
    insuranceId,
    insured
  ) => {
    const requestData = {
      docGenFormFields: [
        {
          documentId,
          docGenFormFieldList: [
            {
              name: "InsuranceId",
              value: insuranceId,
            },
            {
              name: "InsuredName",
              value: insured,
            },
          ],
        },
      ],
    };

    const response = await api.put(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes/${envelopId}/docgenformfields`,
      requestData
    );
    return response.data.envelopeId;
  };

  const sendEnvelop = async (envelopId) => {
    const requestData = {
      status: "sent",
    };

    const response = await api.put(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes/${envelopId}`,
      requestData
    );
    return response.data.envelopeId;
  };

  return {
    createTemplate,
    addDocumentToTemplate,
    addTabsToTemplate,
    createEnvelop,
    getDocumentId,
    updateFormFields,
    sendEnvelop,
  };
};

export const createEmbeddedSigningAPI = (
  axios,
  eSignBase,
  dsReturnUrl,
  accountBaseUrl,
  accountId
) => {
  const api = createAPI(axios);
  console.log("api",api);

  const createEnvelope = async (htmlDoc, signer) => {
    const requestData = {
      emailSubject:
        process.env.REACT_APP_EMBEDDED_DOCUMENT_TEMPLATE_EMAIL_SUBJECT,
      description: process.env.REACT_APP_EMBEDDED_DOCUMENT_TEMPLATE_DESCRIPTION,
      name: process.env.REACT_APP_EMBEDDED_DOCUMENT_TEMPLATE_NAME,
      shared: false,
      status: "sent",
      recipients: {
        signers: [
          {
            email: signer.email,
            name: signer.name,
            recipientId: "1",
            clientUserId: 1000,
            roleName: "signer",
            routingOrder: "1",
          },
        ],
      },
      documents: [
        {
          name: process.env.REACT_APP_EMBEDDED_DOCUMENT_NAME,
          documentId: 1,
          htmlDefinition: {
            source: htmlDoc,
          },
        },
      ],
    };

    console.log(`${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes`);
    console.log("requestData",requestData);
    debugger
    const response = await api.post(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes`,
      requestData
    );
    return response.data.envelopeId;
  };

  const embeddedSigningCeremony = async (envelopeId, signer) => {
    const requestData = {
      returnUrl: dsReturnUrl,
      authenticationMethod: "None",
      clientUserId: 1000,
      email: signer.email,
      userName: signer.name,
    };

    const response = await api.post(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
      requestData
    );

    return response.data.url;
  };

  const embeddedSigning = async (signer, template) => {
    const envelopeId = await createEnvelope(template, signer);
    console.log("envelopeId",envelopeId);
    const url = await embeddedSigningCeremony(envelopeId, signer);

    const signingWindow = window.open(url, "_blank");
    const newTab = signingWindow;
    if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
      // // POPUP BLOCKED
      // onPopupIsBlocked();
      return false;
    }
    signingWindow.focus();
    return envelopeId;
  };

  return {
    embeddedSigning,
  };
};

export const createAuthAPI = (
  axios,
  serviceProvider,
  implicitGrantPath,
  userInfoPath,
  eSignBase,
  scopes,
  clientId,
  returnUrl
) => {
  console.log("in createAuthAPI");
  const api = createAPI(axios);
  console.log("api",api);

  const login = async (nonce, onPopupIsBlocked) => {
    const url =
      `${serviceProvider}${implicitGrantPath}` +
      `?response_type=token` +
      `&scope=${scopes}` +
      `&client_id=${clientId}` +
      `&redirect_uri=${returnUrl}` +
      `&state=${nonce}`;
    const loginWindow = window.open(url, "_blank");
    const newTab = loginWindow;
    if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
      // POPUP BLOCKED
      onPopupIsBlocked();
      return false;
    }
    loginWindow.focus();
    return { window: loginWindow, nonce };
  };

  console.log("serviceProvider",serviceProvider);
  console.log("userInfoPath",userInfoPath);
  const fetchUserInfo = async () => {
    const response = await api.get(`${serviceProvider}${userInfoPath}`);
    return response.data;
  };

  const fetchExternalAccountId = async (accountBaseUrl, accountId) => {
    const response = await api.get(
      `${accountBaseUrl}${eSignBase}/accounts/${accountId}`
    );
    return response.data.externalAccountId;
  };

  return { login, fetchUserInfo, fetchExternalAccountId };
};
