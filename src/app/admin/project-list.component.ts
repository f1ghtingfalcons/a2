import { Component, OnInit, Input } from '@angular/core';
import { ProjectService } from '../http-services/project.service';
import { ActivityLogService } from '../shared/activity-log.service';
import { User, Group } from '../shared/ldap.model';

class Project {
    leads: { cn: string, uid: string }[];
    id: number;
    constructor( public name: string, public group: string, public regex: string) {}
}

@Component({
  selector: 'app-projects',
  templateUrl: 'project-list.component.html'
})
export class ProjectListComponent implements OnInit {
    @Input() groups: Group[];
    @Input() users: User[];
    projectList: Project[] = [];
    search: string;

    constructor( private projectService: ProjectService, private activityLog: ActivityLogService ) {}

    ngOnInit() {
        this.loadProjectList();
    };

    /**
     * Return a list of all the roleman projects
     */
    loadProjectList() {
        this.projectService.getAllProjects().subscribe(
            projects => {
                projects = Object.keys(projects).map(function (key) { return projects[key]; })
                projects.forEach( project => {
                    this.projectList.push( project );
                });
            },
            error => this.activityLog.error('Failed to get projects list: ' + error )
        )
    };


    /**
     * Adds a user to a roleman project
     */
    addProjectLead( user: User, project: Project ) {
        project.leads.push({ cn: user.cn, uid: user.uid });
        this.saveProject( project );
    };

    /**
     * Removes a user from a roleman project
     */
    removeProjectLead( user: User, project: Project ) {
        const toRemove = project.leads.findIndex( function( element ) {
            return user === element;
        });
        project.leads.splice( toRemove, 1 );
        this.saveProject( project );
    };

    /**
     * Commits changes to a roleman project
     */
    saveProject = function( project: Project ) {
        this.projectService.saveProject( project ).subscrive(
            () => this.activityLog.log('Project Saved Sucessfully'),
            error => this.activityLog.error('Failed to save project ' + project.name + ': ' + error ),
            () => this.loadProjectList()
        );
    };

    /**
     * Removes a roleman project
     */
    deleteProject( project: Project ) {
        if ( confirm('Are you sure you want to delete this project?') ) {
            // projects get assigned id's when they are first saved
            // if a project doesn't have an ID it doesn't need to be removed by the backend
            if ( !project.id ) {
                this.projectList.splice( this.projectList.indexOf(project, 1));
            } else {
                this.projectService.deleteProject( project.id ).subscribe(
                    () => this.activityLog.log('Project Sucessfully Removed'),
                    error => this.activityLog.error('Failed to remove project ' + project.name + ': ' + error ),
                    () => this.loadProjectList()
                )
            }
        }
    };
}
