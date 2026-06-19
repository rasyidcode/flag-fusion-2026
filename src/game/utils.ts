export const getRadiusByRank = (rank: number) => {
    const minRadius = 18;
    const maxRadius = 80;
    const step = (maxRadius - minRadius) / 47;
    return minRadius + (rank - 1) * step;
}
