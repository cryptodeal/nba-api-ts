import fetch from 'cross-fetch';
import cheerio from 'cheerio';

/* base url to build API requests */
const baseUrl = 'https://www.basketball-reference.com';

export const loadBoxScorePage = (
	date: string,
	homeTeam: string,
	boxScoreUrl?: string
): Promise<cheerio.Root> => {
	const url: string =
		boxScoreUrl !== undefined
			? `${baseUrl}/boxscores/${boxScoreUrl}.html`
			: `${baseUrl}/boxscores/${date}0${homeTeam}.html`;
	console.log(url);
	return fetch(url).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};

export const loadSeasonsPage = (): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/leagues/`).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};

export const loadPlayerPage = (playerUrl: string): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/players/${playerUrl.slice(0, 1)}/${playerUrl}.html`).then(
		async (result) => {
			const body = await result.text();
			return cheerio.load(body);
		}
	);
};

export const loadSeasonSchedule = (
	league: string,
	year: number,
	month?: string
): Promise<cheerio.Root> => {
	const url = month
		? `${baseUrl}/leagues/${league}_${year}_games-${month}.html`
		: `${baseUrl}/leagues/${league}_${year}_games.html`;
	return fetch(url).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};

export const loadPlayoffSchedule = (
	league: string,
	year: number | string
): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/playoffs/${league}_${year}_games.html`).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};

export const loadTeamPage = (teamAbbr: string, year: number | string): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/teams/${teamAbbr}/${year}.html`).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};

interface TestRequest {
	valid: boolean;
	redirectTo: string;
}

const testTeamIndexRedirect = ($: cheerio.Root): TestRequest => {
	const test: TestRequest = {
		valid: true,
		redirectTo: ''
	};

	$('meta').each(function (i, meta) {
		if (i == 1) {
			if ($(meta).attr('http-equiv') && $(meta).attr('content') !== undefined) {
				test.valid = false;
				const content = $(meta).attr('content');
				if (content) test.redirectTo = content.split('/')[2];
			}
		}
	});
	return test;
};

export const loadTeamIndex = (teamAbbr: string): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/teams/${teamAbbr}/`).then(async (res) => {
		const body = await res.text();
		const $ = cheerio.load(body);
		const { valid, redirectTo } = testTeamIndexRedirect($);
		if (!valid) return loadTeamIndex(redirectTo);
		return $;
	});
};

export const loadTx = (league: string, year: number): Promise<cheerio.Root> => {
	return fetch(`${baseUrl}/leagues/${league}_${year}_transactions.html`).then(async (result) => {
		const body = await result.text();
		return cheerio.load(body);
	});
};
