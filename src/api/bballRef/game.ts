import { loadBoxScorePage } from './fetchers';

class ParsedOfficial {
	constructor(public name?: string, public url?: string, public jerseyNumber?: string) {
		this.name = name;
		this.url = url;
		this.jerseyNumber = jerseyNumber;
	}
}

const parseGameOfficials = ($: cheerio.Root) => {
	const officials: ParsedOfficial[] = [];
	$('strong:contains("Officials:")')
		.parent()
		.find('a')
		.each(function (i, link) {
			let url: string | undefined;
			const href = $(link).attr('href')?.split('/');
			if (href) url = href[href.length - 1].split('.')[0];
			const name = $(link).text().trim();
			const official = new ParsedOfficial(name, url);
			officials.push(official);
		});
	return officials;
};

export const getBoxScore = async (
	date: string,
	homeTeam: string,
	visitingTeam: string,
	num?: number
): Promise<ParsedOfficial[]> => {
	const $ = await loadBoxScorePage(date, homeTeam, num);
	return parseGameOfficials($);
};
