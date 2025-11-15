const PointTable = ({ pointTable }) => {
  return (
    <div>
      <div></div>
      <div>
        <table className="points-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>M</th>
              <th>W</th>
              <th>L</th>
              <th>NRR</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {pointTable &&
              pointTable?.map((team, index) => (
                <tr key={team.id}>
                  <td>{index+1}</td>
                  <td>{team?.team}</td>
                  <td>{team?.matches}</td>
                  <td>{team?.won}</td>
                  <td>{team?.lost}</td>
                  <td>{team?.nrr}</td>
                  <td>{team?.points}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointTable;
