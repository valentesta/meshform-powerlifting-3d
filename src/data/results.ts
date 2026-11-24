export type ResultRow = {
  rank: string
  name: string
  nat: string
  country: string
  className: string
  squat: string
  bench: string
  deadlift: string
  total: string
  wr: string
}

// Final standings of the 2026 IPF Sheffield V Championships, 21 Nov 2026.
// Best attempts in kg from https://www.openipf.org/api/meetcsv/ipf/2608
// (checked 2026-11-23). Classes and "% OF WR" follow the broadcast table in
// references/NUEVA TABLA.png. Values marked with * are estimated from that
// table's scale where the OCR did not read the cell.
export const WOMEN_RESULTS: ResultRow[] = [
  { rank: '1', name: 'SONITA MULUH', nat: 'BEL', country: 'Belgium', className: '84+KG', squat: '330.5', bench: '160', deadlift: '282.5', total: '773', wr: '99.9' },
  { rank: '2', name: 'BRITTANY SCHLATER', nat: 'CAN', country: 'Canada', className: '84+KG', squat: '312.5', bench: '162.5', deadlift: '298.5', total: '773.5', wr: '98.8' },
  { rank: '3', name: 'MEGAN-LI SMITH', nat: 'NZL', country: 'New Zealand', className: '52KG', squat: '177.5', bench: '114.5', deadlift: '200', total: '492', wr: '98.6' },
  { rank: '4', name: 'TIFFANY CHAPON', nat: 'FRA', country: 'France', className: '47KG', squat: '167.5', bench: '105', deadlift: '177.5', total: '450', wr: '98.0*' },
  { rank: '5', name: 'KARLINA TONGOTEA', nat: 'NZL', country: 'New Zealand', className: '84KG', squat: '251', bench: '140', deadlift: '270', total: '661', wr: '97.4' },
  { rank: '6', name: 'SARA NALDI', nat: 'ITA', country: 'Italy', className: '57KG', squat: '201', bench: '110', deadlift: '220', total: '531', wr: '96.8' },
  { rank: '7', name: 'CRANON WORFORD', nat: 'USA', country: 'USA', className: '76KG', squat: '240.5', bench: '135', deadlift: '264', total: '639.5', wr: '96.3' },
  { rank: '8', name: 'JOY NNAMANI', nat: 'ENG', country: 'England', className: '57KG', squat: '185', bench: '100', deadlift: '238.5', total: '523.5', wr: '95.2' },
  { rank: '9', name: 'ZIANA AZARIAH', nat: 'ENG', country: 'England', className: '84KG', squat: '227.5', bench: '125', deadlift: '270.5', total: '623', wr: '94.8*' },
  { rank: '10', name: 'ALBA BOSTROM', nat: 'SWE', country: 'Sweden', className: '63KG', squat: '207.5', bench: '122.5', deadlift: '230', total: '560', wr: '94.2*' },
  { rank: '11', name: 'AMELIE PICHER-PLANTE', nat: 'CAN', country: 'Canada', className: '47KG', squat: '155', bench: '90', deadlift: '182.5', total: '427.5', wr: '93.6*' },
  { rank: '12', name: 'ZUZANNA MAZUR', nat: 'POL', country: 'Poland', className: '76KG', squat: '212.5', bench: '127.5', deadlift: '230', total: '570', wr: '92.9*' },
]

export const MEN_RESULTS: ResultRow[] = [
  { rank: '1', name: 'AUSTIN PERKINS', nat: 'USA', country: 'USA', className: '74KG', squat: '355', bench: '218', deadlift: '355.5', total: '928.5', wr: '104.2' },
  { rank: '2', name: 'RONDEL HUNTE', nat: 'TTO', country: 'Trinidad and Tobago', className: '120KG', squat: '370', bench: '266', deadlift: '390', total: '1026', wr: '102.6' },
  { rank: '3', name: 'ANTHONY MCNAUGHTON', nat: 'USA', country: 'USA', className: '105KG', squat: '375', bench: '256.5', deadlift: '370', total: '1001.5', wr: '102.2' },
  { rank: '4', name: 'JESUS OLIVARES', nat: 'USA', country: 'USA', className: '120+KG', squat: '491', bench: '275', deadlift: '411.5', total: '1177.5', wr: '102.2' },
  { rank: '5', name: 'ADE OMISAKIN', nat: 'ENG', country: 'England', className: '83KG', squat: '310', bench: '210', deadlift: '383.5', total: '903.5', wr: '101.5' },
  { rank: '6', name: 'WILL BALL', nat: 'USA', country: 'USA', className: '93KG', squat: '340', bench: '220', deadlift: '380.5', total: '940.5', wr: '101.4' },
  { rank: '7', name: 'MIKE SLABIC', nat: 'USA', country: 'USA', className: '59KG', squat: '235', bench: '132.5', deadlift: '302.5', total: '670', wr: '100.1' },
  { rank: '8', name: 'GUSTAV HEDLUND', nat: 'SWE', country: 'Sweden', className: '93KG', squat: '337.5', bench: '227.5', deadlift: '355', total: '920', wr: '99.2' },
  { rank: '9', name: 'JOSHUA NGOKA', nat: 'ENG', country: 'England', className: '120KG', squat: '385', bench: '217.5', deadlift: '372.5', total: '975', wr: '97.5' },
  { rank: '10', name: 'ASHTON ROUSKA', nat: 'USA', country: 'USA', className: '120KG', squat: '408.5', bench: '190', deadlift: '372.5', total: '971', wr: '97.1' },
  { rank: '11', name: 'AIMENE NOUARI', nat: 'ALG', country: 'Algeria', className: '93KG', squat: '322.5', bench: '195', deadlift: '381', total: '898.5', wr: '96.9' },
  { rank: '12', name: 'KJELL BAKKELUND', nat: 'NOR', country: 'Norway', className: '66KG', squat: '245', bench: '192.5', deadlift: '305', total: '742.5', wr: '94.9' },
]

export const RESULTS_BY_SEX = {
  women: WOMEN_RESULTS,
  men: MEN_RESULTS,
} as const

export type ResultsSex = keyof typeof RESULTS_BY_SEX
