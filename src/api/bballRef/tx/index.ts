import cheerio from 'cheerio';
import { loadTx } from '../fetchers';
import dayjs from 'dayjs';

interface TxEntity {
	name: string;
	url: string;
}

export type Tx = {
	date: Date;
	details: string;
	players: TxEntity[];
	coaches: TxEntity[];
	teams: TxEntity[];
};

export type SeasonTxList = {
	start?: Date;
	end?: Date;
	txs: Tx[];
};

const getPlayerTx = ($: cheerio.Root) => {
	const seasonTxList: SeasonTxList = {
		txs: []
	};
	$('.page_index')
		.find('li')
		.each(function (i, li) {
			const date = dayjs($(li).find('span').text().trim(), 'MMMM D, YYYY');
			$(li)
				.find('p')
				.each(function (i, p) {
					const tx: Tx = {
						date: new Date(date.toISOString()),
						details: $(p).text().trim(),
						players: [],
						coaches: [],
						teams: []
					};
					$(p)
						.find('a')
						.each(function (i, a) {
							const href = $(a).attr('href');
							if (href) {
								const hrefSplit = href.split('/');
								if (href.includes('coaches')) {
									const coach: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 1].slice(-5)
									};
									tx.coaches.push(coach);
								} else if (href.includes('players')) {
									const player: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 1].slice(-5)
									};
									tx.players.push(player);
								} else if (href.includes('teams')) {
									const team: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 2]
									};
									tx.teams.push(team);
								}
							}
						});
					seasonTxList.txs.push(tx);
				});
		});
	return seasonTxList;
};

export const getSeasonTx = async (league: string, season: number) => {
	const $ = await loadTx(league, season);
	return getPlayerTx($);
};
