"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
class Bring {
    constructor(options) {
        this.mail = options.mail;
        this.password = options.password;
        this.url = options.url || `https://api.getbring.com/rest/v2/`;
        this.uuid = options.uuid || ``;
        this.headers = {
            'X-BRING-API-KEY': `cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp`,
            'X-BRING-CLIENT': `webApp`,
            'X-BRING-CLIENT-SOURCE': `webApp`,
            'X-BRING-COUNTRY': `DE`
        };
    }
    /**
     * Try to log into given account
     */
    async login() {
        let resp = { data: { name: "", uuid: "", access_token: "", refresh_token: "" }, status: {} };
        try {
            resp = await axios_1.default.post(`${this.url}bringauth`, {
                email: this.mail,
                password: this.password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
        catch (e) {
            throw new Error(`Cannot Login: ${e.message}\n\n${e.response.statusText}`);
        }
        this.name = resp.data.name;
        this.uuid = resp.data.uuid;
        this.bearerToken = resp.data.access_token;
        this.refreshToken = resp.data.refresh_token;
        this.headers[`X-BRING-USER-UUID`] = this.uuid;
        this.headers[`Authorization`] = `Bearer ${this.bearerToken}`;
        this.putHeaders = {
            ...this.headers,
            ...{ 'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8` }
        };
    }
    /**
     *   Loads all shopping lists
     */
    async loadLists() {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringusers/${this.uuid}/lists`, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get lists: ${e.message}`);
        }
    }
    /**
     *   Get all items from the current selected shopping list
     */
    async getItems(listUuid) {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringlists/${listUuid}`, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get items for list ${listUuid}: ${e.message}`);
        }
    }
    /**
     *   Get detailed information about all items from the current selected shopping list
     */
    async getItemsDetails(listUuid) {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringlists/${listUuid}/details`, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get detailed items for list ${listUuid}: ${e.message}`);
        }
    }
    /**
     *   Save an item to your current shopping list
     *
     *   @param itemName The name of the item you want to send to the bring server
     *   @param specification The litte description under the name of the item
     *   @param listUuid The listUUID you want to receive a list of users from.
     *   returns an empty string and answerHttpStatus should contain 204. If not -> error
     */
    async saveItem(listUuid, itemName, specification) {
        try {
            const { data, status } = await axios_1.default.put(`${this.url}bringlists/${listUuid}`, `&purchase=${itemName}&recently=&specification=${specification}&remove=&sender=null`, {
                headers: this.putHeaders
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot save item ${itemName} (${specification}) to ${listUuid}: ${e.message}\n\n${e.response}`);
        }
    }
    /**
     *   Save an image to an item
     *
     *   @param itemUuid The itemUUID which will be updated
     *   @param image The image you want to link to the item
     *   returns an imageUrl and answerHttpStatus should contain 204. If not -> error
     */
    async saveItemImage(itemUuid, image) {
        try {
            const { data, status } = await axios_1.default.put(`${this.url}bringlistitemdetails/${itemUuid}/image`, {
                headers: this.putHeaders,
                formData: image
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot save item image ${itemUuid}: ${e.message}\n\n${e.response}`);
        }
    }
    /**
     *   remove an item from your current shopping list
     *
     *   @param listUuid The listUUID you want to remove a item from
     *   @param itemName Name of the item you want to delete from you shopping list
     *   should return an empty string and $answerHttpStatus should contain 204. If not -> error
     */
    async removeItem(listUuid, itemName) {
        try {
            const { data, status } = await axios_1.default.put(`${this.url}bringlists/${listUuid}`, `&purchase=&recently=&specification=&remove=${itemName}&sender=null`, {
                headers: this.putHeaders
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot remove item ${itemName} from ${listUuid}: ${e.message}\n\n${e.response}`);
        }
    }
    /**
     *   Remove the image from your item
     *
     *   @param itemUuid The itemUUID you want to remove the image from
     *   returns an empty string and answerHttpStatus should contain 204. If not -> error
     */
    async removeItemImage(itemUuid) {
        try {
            const { data, status } = await axios_1.default.delete(`${this.url}bringlistitemdetails/${itemUuid}/image`, {
                headers: this.headers
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot remove item image ${itemUuid}: ${e.message}`);
        }
    }
    /**
     *   move an item to recent items list
     *
     *   @param itemName Name of the item you want to delete from you shopping list
     *   @param listUuid The lisUUID you want to receive a list of users from.
     *   should return an empty string and $answerHttpStatus should contain 204. If not -> error
     */
    async moveToRecentList(listUuid, itemName) {
        try {
            const { data, status } = await axios_1.default.put(`${this.url}bringlists/${listUuid}`, `&purchase=&recently=${itemName}&specification=&remove=&&sender=null`, {
                headers: this.putHeaders
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot remove item ${itemName} from ${listUuid}: ${e.message}\n\n${e.response}`);
        }
    }
    /**
     *   Get all users from a shopping list
     *
     *   @param listUuid The listUUID you want to receive a list of users from
     */
    async getAllUsersFromList(listUuid) {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringlists/${listUuid}/users`, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get users from list: ${e.message}`);
        }
    }
    /**
     * Get the user settings
     */
    async getUserSettings() {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringusersettings/${this.uuid}`, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get user settings: ${e.message}`);
        }
    }
    /**
     *   Load translation file e. g. via 'de-DE'
     *   @param locale from which country translations will be loaded
     */
    async loadTranslations(locale) {
        try {
            const { data, status } = await (0, axios_1.default)(`https://web.getbring.com/locale/articles.${locale}.json`);
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get translations: ${e.message}`);
        }
    }
    /**
     *   Load translation file e. g. via 'de-DE'
     *   @param locale from which country translations will be loaded
     */
    async loadCatalog(locale) {
        try {
            const { data, status } = await (0, axios_1.default)(`https://web.getbring.com/locale/catalog.${locale}.json`);
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get catalog: ${e.message}`);
        }
    }
    /**
     *   Get pending invitations
     */
    async getPendingInvitations() {
        try {
            const { data, status } = await (0, axios_1.default)(`${this.url}bringusers/${this.uuid}/invitations?status=pending`, {
                headers: this.headers
            });
            return data;
        }
        catch (e) {
            throw new Error(`Cannot get pending invitations: ${e.message}`);
        }
    }
}
module.exports = Bring;
//# sourceMappingURL=bring.js.map