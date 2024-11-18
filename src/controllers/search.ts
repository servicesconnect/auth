import { projectById, projectsSearch } from "@auth/services/search.service";
import { IPaginateProps, ISearchResult } from "@auth/interfaces";
import { Request, Response } from "express";
import { sortBy } from "lodash";
import { StatusCodes } from "http-status-codes";

export async function projects(req: Request, res: Response): Promise<void> {
  const { from, size, type } = req.params;
  let resultHits: unknown[] = [];
  const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
  const projects: ISearchResult = await projectsSearch(
    `${req.query.query}`,
    paginate,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minPrice}`),
    parseInt(`${req.query.maxPrice}`)
  );
  for (const item of projects.hits) {
    resultHits.push(item._source);
  }
  if (type === "backward") {
    resultHits = sortBy(resultHits, ["sortId"]);
  }
  res.status(StatusCodes.OK).json({
    message: "Search projects results",
    total: projects.total,
    projects: resultHits,
  });
}

export async function singleProjectById(
  req: Request,
  res: Response
): Promise<void> {
  const project = await projectById("projects", req.params.projectId);
  res
    .status(StatusCodes.OK)
    .json({ message: "Signle project result", project });
}
