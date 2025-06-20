import { model, Schema } from "mongoose";
import { randomId } from "../utilities.js";

export interface GuildI {
    _id: string;
    active: boolean;
    guildId: string;
}

const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    active: { required: true, type: Boolean, default: false },
    guildId: { required: true, type: String }
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
