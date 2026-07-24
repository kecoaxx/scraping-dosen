
# Scraper Dosen Indonesia

An open-source web scraper for extracting and structuring Indonesian lecturer (dosen) data from public directories.



## Run Scraper Locally

Clone the project

```bash
  git clone https://github.com/kecoaxx/scraping-dosen.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  pnpm install
```

Start scraping to JSON

```bash
  pnpm scrape [univ]
```

Where [univ] is according to scraper's file name in `src/scrapers`. 

Example: To use `src/scrapers/scraper-ub.js`
```bash
  pnpm scrape ub
```

## Active Scrapers

| University | Short | Status| Description                |
| :----------- | :------- | :------- | :------------------------- |
| Universitas Brawijaya | UB | Active |  |
| Universitas Bangka Belitung | UBB | Active |  |



## License

[MIT](https://choosealicense.com/licenses/mit/)

