
import { CollectionConfig } from 'payload/types'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
      ],
      defaultValue: 'active',
      required: true,
    },
  ],
}
