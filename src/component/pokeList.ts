import { PokemonInfo, Pokemon } from '../model/pokeInfo';
import { Component } from './components';
import { Navigator } from './navigator';
import { PokeApi } from '../data/pokeApi';

export class PokemonList extends Component {
  pokemons: PokemonInfo[];
  pokeRepo: PokeApi;
  itemsPerPage: number;
  offset: number;

  constructor(selector: string) {
    super(selector);
    this.pokemons = [];
    this.pokeRepo = new PokeApi();
    this.itemsPerPage = 20;
    this.offset = 0;
    // eslint-disable-next-line no-new
    new Navigator('main');
    this.handleLoad();
  }

  async render(): Promise<void> {
    super.cleanHtml();
    this.template = await this.createTemplate();
    super.render();
    document
      .querySelector('#poke-items')!
      .addEventListener('change', (event) => {
        const selectedValue = (event.target as HTMLSelectElement).value;
        this.handleDisplayPokemon(selectedValue);
      });

    document
      .querySelector('.next')
      ?.addEventListener('click', this.handleNextButton.bind(this));

    document
      .querySelector('.prev')
      ?.addEventListener('click', this.handlePrevButton.bind(this));
  }

  async handleNextButton() {
    this.offset = this.itemsPerPage + this.offset;
    this.handleLoad();
  }

  async handlePrevButton() {
    if (this.offset === 0) return;
    this.offset = this.itemsPerPage - this.offset;
    this.handleLoad();
  }

  async handleDisplayPokemon(selectedValue: string) {
    this.itemsPerPage = Number(selectedValue);
    this.handleLoad();
  }

  async handleLoad() {
    this.pokemons = await this.pokeRepo.getAll(this.itemsPerPage, this.offset);
    this.render();
  }

  async handleGetOnePokemonInfo(url: string) {
    return this.pokeRepo.getPokemon(url);
  }

  async createTemplate() {
    const promiseArray: Promise<Pokemon>[] = [];

    this.pokemons.forEach((element) => {
      promiseArray.push(this.handleGetOnePokemonInfo(element.url));
    });

    const pokemonInformation = await Promise.all(promiseArray);

    const pokeList = pokemonInformation
      .map(
        (item) =>
          `
          <li>
            <p>${item.name}</p>
            <img src="${item.imgUrl}" width="170" height="150">

          </li>
          `
      )
      .join('');

    return `
      <section class="pokemon-list">
        <ul>${pokeList}</ul>
      </section>
    `;
  }
}
