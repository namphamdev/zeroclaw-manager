import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProvider extends Document {
  name: string;
  baseUrl: string;
  apiKey?: string;
}

const ProviderSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  baseUrl: { type: String, required: true },
  apiKey: { type: String },
}, { timestamps: true });

const Provider: Model<IProvider> = mongoose.models.Provider || mongoose.model<IProvider>('Provider', ProviderSchema);

export default Provider;
