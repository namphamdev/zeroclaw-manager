import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstance extends Document {
  name: string;
  config: any; // Can be more specific if we map config.toml
  status: 'stopped' | 'running' | 'error';
  workspacePath: string;
  pid?: number;
}

const InstanceSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  config: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['stopped', 'running', 'error'], default: 'stopped' },
  workspacePath: { type: String, required: true },
  pid: { type: Number },
}, { timestamps: true });

const Instance: Model<IInstance> = mongoose.models.Instance || mongoose.model<IInstance>('Instance', InstanceSchema);

export default Instance;
