//                  // Все глобальные переменные
//------------------//
let P = 3;          // Количество боёв
let M = 1;          // Число парных встреч
let K_min = 3;      // Минимальное число команд в аудитории
let K_max = 4;      // Макимальное число команд в аудитории
let R = 5;          // Количество аудиторий
let N = 14;         // Количество команд
let Rooms = [];     // Аудитории
let Teams = [];     // Названия команд
let History = {};   // История встреч команд
//------------------//

function set_rooms(R)
{
    Rooms.length = 0;
    
    for (let i = 1; i <= R; ++i)
    {
        Rooms.push("Аудитория № " + i);
    }
}

function set_teams(N)
{
    Teams.length = 0;
        
    for (let i = 1; i <= N; ++i)
    {
        Teams.push("Команда " + i);
    }
}

function set_history()
{
    for (let team in Teams)
    {
      let team_name = Teams[team];
      History[team_name] = {};
      
      for (let key in Teams)
      {
        if (key != team) History[team_name][Teams[key]] = M;
      }
    }
}

function create_error()
{
    let html = "";
    
    html += '<div id="error">';
    html += 'Введённые вами данные не корректны. Пожалуйста, измените ввод.';
    html += '<\/div>';
    
    document.getElementById("result").innerHTML = html;
}

function create_fail()
{
    let html = "";
    
    html += '<div id="fail">';
    html += 'Не удалось построить распределение команд по аудиториям.<br/>';
    html += 'Попробуйте уменьшить количество боёв или изменить другие параметры.<br/>';
    html += 'А можете испытать удачу и нажать на кнопку ещё раз. =)';
    html += '<\/div>';
    
    document.getElementById("result").innerHTML = html;
}

function create_table(Meetings, num) 
{
    let Dist = Meetings[num];
    let html = "";

    ++num;
    html += '<div id="fight-' + num + '"><h3>Бой № ' + num + '<\/h3><\/div>';
    html += '<div id="distr-' + num + '">';
    html += '<table width="80%" border="1">';
    --num;

    html += "<tr>";
    html += "<th>Начальная роль<\/th>";
    for(let i in  Dist)
    {
        html += "<th>" + Rooms[i] + "<\/th>";
    }
    html += "<\/tr>";
    
    let Role = ["Докладчик", "Оппонент", "Рецензент"];
    Role.length = Dist[0].length;
    Role.fill("Наблюдатель", 3);
    
    for(let team in Dist[0])
    {
        html += "<tr>";
        html += "<td>" + Role[team] + "<\/td>";
        for (let room in Dist)
        {
            let team_name = Dist[room][team];
            if ( typeof team_name === "undefined" ) team_name = "";
            html += "<td>" + team_name + "<\/td>";
        }
        html += "<\/tr>";
    }
    
    html += "<\/table> ";
    html += "<\/div>";
    
    document.getElementById("result").innerHTML += html;
}

function set_playgrounds(Playgrounds, R, K_min, K_max)
{
    // Количество комнат
	let R_i = Math.floor(N / K_min);
	if (R_i > R) R_i = R;
	
    // Максимальное количество команд в комнате
	let K_i = Math.ceil(N / R_i);
    if (K_i > K_max) return false;
    
    // Количество комнат с бо'льшим числом команд
	let R_0 = N - R_i*(K_i - 1);
    
    Playgrounds.length = R_i; 
	Playgrounds.fill(K_i, 0, R_0);
	Playgrounds.fill(K_i - 1, R_0, R_i);

	return true;
}

function rand(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

function alert_obj(obj)
{
	alert( JSON.stringify(obj, "", 4) );
}

function choose_team(room_0, Distribution, Candidates, History)
{
  let Candidates_in_Room = Candidates.slice();
  
  for (let i in Distribution[room_0])
  {
    let team_name_i = Distribution[room_0][i];
    if (team_name_i === 0) break;

    for (let j = 0; j < Candidates_in_Room.length; ++j)
    {
        if ( History[Candidates_in_Room[j]][team_name_i] < 1)
        {       
            Candidates_in_Room.splice(j--, 1);
        }
    }
  }
  
  if (Candidates_in_Room.length < 1) return -1;

  let rank = (new Array(Candidates_in_Room.length)).fill(0);
  
  for (let team in Candidates_in_Room)
  {
    for (let room in Distribution)
    {
      let flag = true;
      
      for (let i in Distribution[room])
      {
        let team_name_i = Distribution[room][i];
        if (team_name_i === 0) break;
        
        if ( History[Candidates_in_Room[team]][team_name_i] < 1)
        {       
          flag = false;
          break;
        } 
      }
      
      if (flag) rank[team] += 1;
    }
  }
  
  let k_min = 0, k_max = 0;
  
  for (let i in rank)
  {
    if (rank[i] === 0) continue;
    
    k_min = k_max = i;
    break;
  }
  
  for (let i in rank)
  {
    if (rank[i] === 0) continue;
    if (rank[i] > rank[k_max]) k_max = i;
    if (rank[i] < rank[k_min]) k_min = i;
  }
  if (rank[k_max] === 0) return -1;
  
  let Possible_Teams = [];
  for (let i in rank)
  {
    if (rank[i] === rank[k_min]) Possible_Teams.push(i);
  }

  return Candidates_in_Room[rand(0, Possible_Teams.length)];
}

function try_distribute(Distribution, Candidates, History)
{
  for (let room in Distribution)
  {
    let team = rand(0, Candidates.length);
    Distribution[room][0] = Candidates[team];
    Candidates.splice(team, 1);
  }
  
  while (Candidates.length > 0)
  { 
    for (let room in Distribution)
    {
      let i = Distribution[room].indexOf(0);
      if (i < 0) continue;
      
      // возможно стоит выбирать команду с минимальными шансами и находить для неё комнату
      team_name = choose_team(room, Distribution, Candidates, History);
      if (team_name < 0) return false;
      
      for (let j = 0; j < i; ++j)
      {
        History[team_name][Distribution[room][j]] -= 1;
        History[Distribution[room][j]][team_name] -= 1;
      }
      
      Distribution[room][i] = team_name;
      Candidates.splice(Candidates.indexOf(team_name), 1);
    }
  }
  
  return true;
}

function distribute_teams(Teams, History, R, K_min, K_max)
{
  let Playgrounds = [];
  if ( ! set_playgrounds(Playgrounds, R, K_min, K_max) ) return false;
  
  let Distribution = (new Array(Playgrounds.length)).fill([]);
  for (let num in Distribution)
  {
    Distribution[num] = (new Array(Playgrounds[num])).fill(0);
  }
  
  for (let i = 0; i < 1e+3; ++i)
  {
    let Dist = JSON.parse(JSON.stringify(Distribution));
    let Cand = JSON.parse(JSON.stringify(Teams));
    let Hist = JSON.parse(JSON.stringify(History));
    
    if ( try_distribute(Dist, Cand, Hist) )
    {
      return [Dist, Hist];
    }
  }
  
  return false;
}

function set_variables()
{
    let Data = {};
    
    Data.fight_num = document.getElementById("fight-num");
    Data.meet_max = document.getElementById("meet-max");
    Data.team_min = document.getElementById("team-min");
    Data.team_max = document.getElementById("team-max");
    Data.room_num = document.getElementById("room-num");
    Data.team_num = document.getElementById("team-num");
    
    for (let key in Data)
    {
        if (Data.key === "undefined") return false;
    }
    
    P = Data.fight_num.value;
    M = Data.meet_max.value;
    K_min = Data.team_min.value;
    K_max = Data.team_max.value;
    
    if ( isFinite(Data.room_num.value) )
    {
        R = Data.room_num.value;
        set_rooms(R);
    }
    else
    {
        Rooms = Data.room_num.value.split(",");
        for (let room in Rooms) room.trim();
        R = Rooms.length;
    }
    
    if ( isFinite(Data.team_num.value) )
    {
        N = Data.team_num.value;
        set_teams(N);
    }
    else
    {
        Teams = Data.team_num.value.split(",");
        for (let team in Teams) team.trim();
        N = Teams.length;
    }
    
    set_history();
    
    return true;
}

function main()
{
    if ( ! set_variables() )
    {
        create_error();
        return;
    };
    
    let Meeting_Schedule = [];
    for (let k = 0; k < P; ++k)
    {
        let DistHist = distribute_teams(Teams, History, R, K_min, K_max);
        let Dist = "Fail";
        if ( DistHist !== false )
        {
            Dist = DistHist[0];
            History = DistHist[1];
        }
        Meeting_Schedule.push(Dist);
    }
    
    document.getElementById("result").innerHTML = "";
    
    if (Meeting_Schedule.indexOf("Fail") < 0)
    {
        for (let num in Meeting_Schedule) create_table(Meeting_Schedule, num);
    }
    else
    {
        create_fail();
    }
}