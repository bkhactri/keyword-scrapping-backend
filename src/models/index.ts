import sequelize from '@src/config/database';
import UserModel from './user.model';
import KeywordModel from './keyword.model';
import HtmlPageCacheModel from './html-page-cache.model';
import SearchResultModel from './search-result.model';
import UserConnectionModel from './user-connection.model';

export const User = UserModel(sequelize);
export const Keyword = KeywordModel(sequelize);
export const HtmlPageCache = HtmlPageCacheModel(sequelize);
export const SearchResult = SearchResultModel(sequelize);
export const UserConnection = UserConnectionModel(sequelize);

// Relations
Keyword.hasOne(SearchResult, {
  foreignKey: 'keywordId',
  as: 'searchResult',
});

SearchResult.belongsTo(Keyword, {
  foreignKey: 'keywordId',
});
