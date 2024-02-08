import { Injectable, WritableSignal, signal, Signal, computed} from '@angular/core';
import { GameState, ReversiModelInterface, TileCoords, Board } from './data/reversi.definitions';
import { initialGameState, tryPlay } from './data/reversi.game';
import { initMatrix } from './data/utils';



@Injectable({
  providedIn: 'root'
})
  

export class ReversiService implements ReversiModelInterface {

  private readonly _sigGameState: WritableSignal<GameState> = signal<GameState>(initialGameState);
  public readonly sigGameState: Signal<GameState> = computed(() => this._sigGameState());

  

  
  play(coord: TileCoords): void{
    const newState: GameState = tryPlay(this.sigGameState(), coord[0], coord[1]);
    this._sigGameState.set(newState);
  }   
  
  restart(): void{
    this._sigGameState.set(initialGameState);
  }

  constructor() { }
}
