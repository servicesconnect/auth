import { elasticSearchClient, getDocumentById } from "@auth/config";
import {
  IHitsTotal,
  IPaginateProps,
  IQueryList,
  ISearchResult,
  ISellerProject,
} from "@auth/interfaces";

import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";

export async function projectById(
  index: string,
  projectId: string
): Promise<ISellerProject> {
  const project = await getDocumentById(index, projectId);
  return project;
}

export async function projectsSearch(
  searchQuery: string,
  paginate: IPaginateProps,
  deliveryTime?: string,
  min?: number,
  max?: number
): Promise<ISearchResult> {
  const { from, size, type } = paginate;
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: [
          "username",
          "title",
          "description",
          "basicDescription",
          "basicTitle",
          "categories",
          "subCategories",
          "tags",
        ],
        query: `*${searchQuery}*`,
      },
    },
    {
      term: {
        active: true,
      },
    },
  ];

  if (deliveryTime !== "undefined") {
    queryList.push({
      query_string: {
        fields: ["expectedDelivery"],
        query: `*${deliveryTime}*`,
      },
    });
  }

  if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min,
          lte: max,
        },
      },
    });
  }
  const result: SearchResponse = await elasticSearchClient.search({
    index: "projects",
    size,
    query: {
      bool: {
        must: [...queryList],
      },
    },
    sort: [
      {
        sortId: type === "forward" ? "asc" : "desc",
      },
    ],
    ...(from !== "0" && { search_after: [from] }),
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
}
