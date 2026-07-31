import { fsService } from './fs.service.js'

/**
 * Initialize RacerFS system
 * - Ensure ~/.racerfs directory exists
 */
export function InitRacerFS(): void {
  fsService.ensureConfigDir()
}
