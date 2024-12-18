import axios from 'axios';

interface BringOptions {
    mail: string;
    password: string;
    url?: string;
    uuid?: string;
}

interface GetItemsResponseEntry {
    specification: string;
    name: string;
}

interface GetItemsResponse {
    uuid: string;
    status: string;
    purchase: GetItemsResponseEntry[];
    recently: GetItemsResponseEntry[];
}

interface GetAllUsersFromListEntry {
    publicUuid: string;
    name: string;
    email: string;
    photoPath: string;
    pushEnabled: boolean;
    plusTryOut: boolean;
    country: string;
    language: string;
}
interface GetAllUsersFromListResponse {
    users: GetAllUsersFromListEntry[];
}

interface LoadListsEntry {
    listUuid: string;
    name: string;
    theme: string;
}

interface LoadListsResponse {
    lists: LoadListsEntry[];
}

interface GetItemsDetailsEntry {
    uuid: string;
    itemId: string;
    listUuid: string;
    userIconItemId: string;
    userSectionId: string;
    assignedTo: string;
    imageUrl: string;
}

interface UserSettingsEntry {
    key: string;
    value: string;
}

interface UserListSettingsEntry {
    listUuid: string;
    usersettings: UserSettingsEntry[];
}

interface GetUserSettingsResponse {
    userSettings: UserSettingsEntry[];
    userlistsettings: UserListSettingsEntry[];
}

interface CatalogItemsEntry {
    itemId: string;
    name: string;
}

interface CatalogSectionsEntry {
    sectionId: string;
    name: string;
    items: CatalogItemsEntry[];
}

interface LoadCatalogResponse {
    language: string;
    catalog: {
        sections: CatalogSectionsEntry[];
    };
}

interface GetPendingInvitationsResponse {
    invitations: any[];
}

interface Image {
    /** the image itself */
    imageData: string;
}

class Bring {
    private readonly mail: string;
    private readonly password: string;
    private readonly url: string;
    private uuid: string;
    private readonly headers: {
        'X-BRING-CLIENT-SOURCE': string;
        'X-BRING-COUNTRY': string;
        'X-BRING-CLIENT': string;
        'X-BRING-API-KEY': string;
        Authorization?: string;
        'X-BRING-USER-UUID'?: string;
    };
    public name?: string;
    private bearerToken?: string;
    private refreshToken?: string;
    private putHeaders?: {
        Authorization?: string;
        'X-BRING-USER-UUID'?: string;
        'X-BRING-CLIENT-SOURCE': string;
        'X-BRING-COUNTRY': string;
        'X-BRING-CLIENT': string;
        'X-BRING-API-KEY': string;
        'Content-Type': string;
    };

    constructor(options: BringOptions) {
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
    async login(): Promise<void> {        
        let resp =  { data: { name: "", uuid: "", access_token: "", refresh_token: "" }, status: {} };
        try {
            resp = await axios.post(`${this.url}bringauth`, {
                email: this.mail,
                password: this.password
            }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        } catch (e: any) {
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
    async loadLists(): Promise<LoadListsResponse> {
        try {
            const { data, status } = await axios(`${this.url}bringusers/${this.uuid}/lists`, { headers: this.headers });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get lists: ${e.message}`);
        }
    }

    /**
     *   Get all items from the current selected shopping list
     */
    async getItems(listUuid: string): Promise<GetItemsResponse> {
        try {
            const { data, status } = await axios(`${this.url}bringlists/${listUuid}`, { headers: this.headers });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get items for list ${listUuid}: ${e.message}`);
        }
    }

    /**
     *   Get detailed information about all items from the current selected shopping list
     */
    async getItemsDetails(listUuid: string): Promise<GetItemsDetailsEntry[]> {
        try {
            const { data, status } = await axios(`${this.url}bringlists/${listUuid}/details`, { headers: this.headers });
            return data;
        } catch (e: any) {
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
    async saveItem(listUuid: string, itemName: string, specification: string): Promise<string> {
        try {
            const { data, status } = await axios.put(`${this.url}bringlists/${listUuid}`, `&purchase=${itemName}&recently=&specification=${specification}&remove=&sender=null`,
            {
                headers: this.putHeaders
            });
            return data;
        } catch (e: any) {
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
    async saveItemImage(itemUuid: string, image: Image): Promise<{ imageUrl: string }> {
        try {
            const { data, status } = await axios.put(`${this.url}bringlistitemdetails/${itemUuid}/image`, {
                headers: this.putHeaders,
                formData: image
            });
            return data;
        } catch (e: any) {
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
    async removeItem(listUuid: string, itemName: string): Promise<string> {
        try {
            const { data, status } = await axios.put(`${this.url}bringlists/${listUuid}`, `&purchase=&recently=&specification=&remove=${itemName}&sender=null`, 
            {
                headers: this.putHeaders
            });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot remove item ${itemName} from ${listUuid}: ${e.message}\n\n${e.response}`);
        }
    }

    /**
     *   Remove the image from your item
     *
     *   @param itemUuid The itemUUID you want to remove the image from
     *   returns an empty string and answerHttpStatus should contain 204. If not -> error
     */
    async removeItemImage(itemUuid: string): Promise<string> {
        try {
            const { data, status } = await axios.delete(`${this.url}bringlistitemdetails/${itemUuid}/image`, {
                headers: this.headers
            });
            return data;
        } catch (e: any) {
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
    async moveToRecentList(listUuid: string, itemName: string): Promise<string> {
        try {
            const { data, status } = await axios.put(`${this.url}bringlists/${listUuid}`, `&purchase=&recently=${itemName}&specification=&remove=&&sender=null`,             
            {
                headers: this.putHeaders
            });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot remove item ${itemName} from ${listUuid}: ${e.message}\n\n${e.response}`);
        }
    }

    /**
     *   Get all users from a shopping list
     *
     *   @param listUuid The listUUID you want to receive a list of users from
     */
    async getAllUsersFromList(listUuid: string): Promise<GetAllUsersFromListResponse> {
        try {
            const { data, status } = await axios(`${this.url}bringlists/${listUuid}/users`, { headers: this.headers });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get users from list: ${e.message}`);
        }
    }

    /**
     * Get the user settings
     */
    async getUserSettings(): Promise<GetUserSettingsResponse> {
        try {
            const { data, status } = await axios(`${this.url}bringusersettings/${this.uuid}`, { headers: this.headers });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get user settings: ${e.message}`);
        }
    }

    /**
     *   Load translation file e. g. via 'de-DE'
     *   @param locale from which country translations will be loaded
     */
    async loadTranslations(locale: string): Promise<Record<string, string>> {
        try {
            const { data, status } = await axios(`https://web.getbring.com/locale/articles.${locale}.json`);
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get translations: ${e.message}`);
        }
    }

    /**
     *   Load translation file e. g. via 'de-DE'
     *   @param locale from which country translations will be loaded
     */
    async loadCatalog(locale: string): Promise<LoadCatalogResponse> {
        try {
            const { data, status } = await axios(`https://web.getbring.com/locale/catalog.${locale}.json`);
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get catalog: ${e.message}`);
        }
    }

    /**
     *   Get pending invitations
     */
    async getPendingInvitations(): Promise<GetPendingInvitationsResponse> {
        try {
            const { data, status } = await axios(`${this.url}bringusers/${this.uuid}/invitations?status=pending`, {
                headers: this.headers
            });
            return data;
        } catch (e: any) {
            throw new Error(`Cannot get pending invitations: ${e.message}`);
        }
    }
}

export = Bring;
