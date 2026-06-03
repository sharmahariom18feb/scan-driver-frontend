import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'
import { WhatsAppIcon } from '@/components/common/icons'

export function FloatingWhatsApp() {
  return (
    <a
      href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-7 right-7 z-[800] w-[58px] h-[58px] rounded-full bg-wa-green flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.4)] animate-wa-pop hover:scale-110 hover:shadow-[0_10px_32px_rgba(37,211,102,0.55)] transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="w-7 h-7 text-white" />
    </a>
  )
}
