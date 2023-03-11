## Getting started

### Installation
```sh
conda create -n ipyniivue-dev -c conda-forge nodejs yarn python jupyterlab
conda activate ipyniivue-dev
git clone --recurse-submodules https://github.com/niivue/ipyniivue.git
cd ipyniivue
yarn
pip install -e .
yarn run build
jupyter lab
```

To view changes made in the typescript, reload the jupyter page. To view changes made in the python, restart the kernel.
