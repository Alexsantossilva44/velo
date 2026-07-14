import type { ExteriorColor, WheelType } from '@/store/configuratorStore'

import glacierBlueAero from '@/assets/glacier-blue-aero-wheels.png'
import glacierBlueSport from '@/assets/glacier-blue-sport-wheels.png'
import lunarWhiteAero from '@/assets/lunar-white-aero-wheels.png'
import lunarWhiteSport from '@/assets/lunar-white-sport-wheels.png'
import midnightBlackAero from '@/assets/midnight-black-aero-wheels.png'
import midnightBlackSport from '@/assets/midnight-black-sport-wheels.png'

export const CAR_IMAGES: Record<ExteriorColor, Record<WheelType, string>> = {
  'glacier-blue': { aero: glacierBlueAero, sport: glacierBlueSport },
  'lunar-white': { aero: lunarWhiteAero, sport: lunarWhiteSport },
  'midnight-black': { aero: midnightBlackAero, sport: midnightBlackSport },
}

export const COLOR_LABELS: Record<ExteriorColor, string> = {
  'glacier-blue': 'Glacier Blue',
  'lunar-white': 'Lunar White',
  'midnight-black': 'Midnight Black',
}
