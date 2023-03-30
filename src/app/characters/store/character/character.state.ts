import { State, Action, StateContext, Selector } from '@ngxs/store';
import { GetCharacters, LoadMoreCharacters } from './character.actions';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CharacterResponse } from '../../model/character-response';
import { CharacterApiService } from '../../data-access/character-api.service';

interface CharacterStateModel {
    characters: CharacterResponse;
}

@State<CharacterStateModel>({
    name: 'characters',
    defaults: {
        characters: {
            count: 0,
            next: '',
            previous: '',
            results: []
        }
    }
})

@Injectable()
export class CharacterState {
    constructor(private characterApiService: CharacterApiService) {}

    @Selector()
    static getCharacters(state: CharacterStateModel) {
        return state.characters;
    }

    @Action(GetCharacters)
    getCharacters(ctx: StateContext<CharacterStateModel>) {
        return this.characterApiService.getCharacters().pipe(tap((response: CharacterResponse) => {
            ctx.patchState({
                characters: response
            });
        }));
    }

    @Action(LoadMoreCharacters)
    loadMoreCharacters(ctx: StateContext<CharacterStateModel>, {nextPageUrl}: LoadMoreCharacters) {
        
        return this.characterApiService.get(nextPageUrl).pipe(tap((response: CharacterResponse) => {
            const state = ctx.getState();

            state.characters.count = response.count;
            state.characters.next = response.next;
            state.characters.previous = response.previous;
            state.characters.results = state.characters.results.concat(response.results);
            
            ctx.patchState({
                characters: state.characters
            });
        }));
    }
}