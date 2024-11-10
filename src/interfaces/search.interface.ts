import {
  Field,
  QueryDslRangeQuery,
  SearchHit,
} from "@elastic/elasticsearch/lib/api/types";

export interface IPaginateProps {
  from: string;
  size: number;
  type: string;
}

export interface ISearchResult {
  hits: SearchHit[];
  total: number;
}

export interface IQueryList {
  query_string?: IQueryString;
  range?: Partial<Record<Field, QueryDslRangeQuery>>;
  term?: ITerm;
}

export interface IQueryString {
  fields: string[];
  query: string;
}

export interface ITerm {
  active: boolean;
}

export interface IHitsTotal {
  value: number;
  relation: string;
}
