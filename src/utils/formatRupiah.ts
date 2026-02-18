export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const generateWhatsAppMessage = (
  name: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
  method: string,
  address?: string,
  tableNo?: string,
  pickupTime?: string
): string => {
  const orderItems = items
    .map(item => `${item.quantity} ${item.name} (${formatRupiah(item.price)})`)
    .join(', ')
  
  let message = `Halo Admin, saya ${name}.\n\nOrder: ${orderItems}\n\nTotal: ${formatRupiah(total)}\nMetode: ${method}`
  
  if (method === 'delivery' && address) {
    message += `\nAlamat: ${address}`
  } else if (method === 'dine-in' && tableNo) {
    message += `\nNomor Meja: ${tableNo}`
  } else if (method === 'pickup' && pickupTime) {
    message += `\nWaktu Pickup: ${pickupTime}`
  }
  
  return message
}