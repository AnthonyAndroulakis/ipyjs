## Getting started

### Installation
```sh
conda create -n ipyjs-dev -c conda-forge nodejs yarn python jupyterlab
conda activate ipyjs-dev
git clone --recurse-submodules https://github.com/AnthonyAndroulakis/ipyjs.git
cd ipyniivue
yarn
pip install -e .
yarn run watch
```
Then, in a separate cmd/terminal window:
```sh
conda activate ipyjs-dev
jupyter lab
```

To view changes made in the typescript, reload the jupyter page. To view changes made in the python, restart the kernel.

** if `yarn run watch` does not work, run the following instead:
```
sudo npm i -g npm-run-all
npm-run-all -p watch:*
```
