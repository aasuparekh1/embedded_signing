import { authenticationAPI } from "../api";

async function getAccountInfo() {
    let userInfoResponse;
    try {
        userInfoResponse = await authenticationAPI.fetchUserInfo();
    } catch (e) {
        // handleError({
        //     title: "Problem while completing login.",
        //     description: `Error: ${e.toString()}. Please repeat your login.`,
        // });
        return false;
    }

    const userInfo = {
        name: userInfoResponse.name,
        userId: userInfoResponse.sub,
        email: userInfoResponse.email,
        accounts: userInfoResponse.accounts.map((a) => ({
            accountId: a.account_id,
            accountExternalId: null,
            accountName: a.account_name,
            accountIsDefault: a.is_default,
            accountBaseUrl: a.base_uri,
        })),
    };

    const defaultAccount = userInfo.accounts.find((a) => a.accountIsDefault);
    if (defaultAccount) {
        userInfo.defaultAccountId = defaultAccount.accountId;
        userInfo.defaultAccountName = defaultAccount.accountName;
        userInfo.defaultAccountBaseUrl = defaultAccount.accountBaseUrl;
    }

    return userInfo;
}

export default getAccountInfo;
