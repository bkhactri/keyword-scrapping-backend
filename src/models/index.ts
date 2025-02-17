import sequelize from '@src/config/database';
import UserModel from './user.model';
import KeywordModel from './keyword.model';
import HtmlPageCacheModel from './html-page-cache.model';
import SearchResultModel from './search-result.model';

export const User = UserModel(sequelize);
export const Keyword = KeywordModel(sequelize);
export const HtmlPageCache = HtmlPageCacheModel(sequelize);
export const SearchResultM = SearchResultModel(sequelize);
