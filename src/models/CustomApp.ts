import { Document, model, Schema } from 'mongoose';
import { ActivityPlatform, PresenceUpdateStatus } from 'seyfert/lib/types/index.js';
import { randomId } from '../utilities.js';

interface AppPresenceI {
    text: string;
    platform: ActivityPlatform;
    status: PresenceUpdateStatus;
}

export interface CustomAppI extends Document<string> {
    appId: string;
    guildId: string;
    ownerId: string;
    appToken?: string;
    presences?: AppPresenceI[];
}

const appPresenceSchema = new Schema<AppPresenceI>({
    text: { required: true, type: String },
    status: { required: true, type: String },
    platform: { required: false, type: String }
}, { _id: false, versionKey: false });

const customAppSchema = new Schema<CustomAppI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    appId: { required: true, type: String },
    guildId: { required: true, type: String },
    ownerId: { required: true, type: String },
    appToken: { required: false, type: String },
    presences: { required: false, type: [appPresenceSchema] }
}, { _id: false, versionKey: false, timestamps: true });

export default model('custom-apps', customAppSchema);
