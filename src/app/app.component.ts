import { ChangeDetectionStrategy, Component, Signal, computed, signal } from '@angular/core';
import { Matrix, initMatrix, IntRange, range } from './data/utils';
import { Board, BoardtoString, GameState, TileCoords, Turn, cToString } from './data/reversi.definitions';
import { produce } from 'immer';
import { whereCanPlay } from './data/reversi.game';
import { ReversiService } from './reversi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  
  public strInput = "";

  constructor(private service: ReversiService) {}

  readonly strBoard = computed( () => BoardtoString(this.service.sigGameState().board) );
  readonly range8 = () => range(0,8);

  symbol() { return cToString(this.service.sigGameState().turn); }
  player() { return this.service.sigGameState().turn; }
  case(i: number, j: number) { return this.gs().gameState.board.at(i)?.at(j) }
  isPlayable(i: number, j: number) { return this.gs().isPlayable.at(i)?.at(j) }

  isInt8(n: number): n is IntRange<0, 8> { return Number.isInteger(n) && n >= 0 && n < 8; }

  play(i: number, j: number) {
    const x = this.isInt8(i) ? i : undefined;
    const y = this.isInt8(j) ? j : undefined;
    if (x !== undefined && y !== undefined)
      this.service.play([x, y]);
  }

  restart() {this.service.restart()}

  readonly gs = computed<GameStateAll>(() => {
    let gameState = this.service.sigGameState();
    let listPlayable = whereCanPlay(gameState);
    let matrice8x8deFalse = initMatrix(() => false, 8, 8);
    
    let Player1 = 0;
    let Player2 = 0;
    for (let row of gameState.board) {
      for (let c of row) {
        if (c === 'Player1') Player1++;
        else if (c === 'Player2') Player2++;
      }
    }

    let winner: undefined | "Drawn" | Turn = undefined;
    if (listPlayable.length == 0) {
      if (Player1 == Player2)
        winner = "Drawn";
      else if (Player1 > Player2)
        winner = "Player1";
      else
        winner = "Player2";
    }

    return {
      gameState,
      listPlayable,
      isPlayable: produce(matrice8x8deFalse, mutableMatrice => {
        for (let coords of listPlayable)
          mutableMatrice[coords[0]][coords[1]] = true;
      }),
      scores: { Player1, Player2 },
      boardString: this.strBoard(),
      winner
    };
  })
}

export interface GameStateAll {
  readonly gameState: GameState;
  readonly listPlayable: readonly TileCoords[];
  readonly isPlayable: Matrix<boolean, 8, 8>;
  readonly scores: Readonly<{ Player1: number, Player2: number }>;
  readonly boardString: string;
  readonly winner: undefined | "Drawn" | Turn;
}