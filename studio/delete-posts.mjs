import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '2omgdk67',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN
})

const docs = await client.fetch('*[_type == "blogPost"]._id')
console.log(`Found ${docs.length} blogPost documents to delete`)

if (docs.length > 0) {
  const transaction = client.transaction()
  for (const id of docs) {
    transaction.delete(id)
  }
  const result = await transaction.commit()
  console.log(`Deleted ${docs.length} documents`)
}
