import { CollectionConfig } from 'payload/types'
import { v4 as uuidv4 } from 'uuid'

const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateId',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'certificateId',
      type: 'text',
      unique: true,
      index: true,
      defaultValue: () => uuidv4(),
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
    },
    {
      name: 'completionDate',
      type: 'date',
      required: true,
    },
  ],
}

export default Certificates
