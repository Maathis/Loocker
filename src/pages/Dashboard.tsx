import RecipeConfigurator from "../components/RecipeConfigurator";
import FilesSelector from "../components/FilesSelector";
import { Component } from "react";

export class Dashboard extends Component {
    render() {
      return <>
       <FilesSelector/>
       <RecipeConfigurator/>
      </>;
    }
}