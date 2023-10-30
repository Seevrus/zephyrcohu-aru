import { compareAsc, parseISO } from 'date-fns';

import {
  type ActiveRoundResponseData,
  type RoundsResponseType,
} from '../response-types/ActiveRoundResponseType';

export function mapRoundsResponse(
  response: RoundsResponseType
): ActiveRoundResponseData {
  return response.data
    ?.sort((round1, round2) =>
      compareAsc(parseISO(round1.roundStarted), parseISO(round2.roundStarted))
    )
    ?.findLast((round) => !round.roundFinished);
}
